use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::AppHandle;
use tokio::task::spawn_blocking;

use super::{get_adb_path, installer, is_platform_tools_installed};

/// 设备连接类型
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DeviceConnectionType {
    Usb,
    Wifi,
}

/// 设备信息
#[derive(Debug, Serialize, Deserialize)]
pub struct Device {
    pub id: String,
    pub status: String,
    #[serde(rename = "connectionType")]
    pub connection_type: DeviceConnectionType,
}

/// 初始化 platform-tools
#[tauri::command]
pub async fn init_platform_tools(app: AppHandle) -> Result<(), String> {
    spawn_blocking(move || {
        installer::init_platform_tools(&app)
            .map_err(|e| format!("Failed to initialize platform-tools: {}", e))
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

/// 检查 platform-tools 是否已安装
#[tauri::command]
pub async fn is_platform_tools_ready(app: AppHandle) -> bool {
    // 这是一个快速的文件系统检查，但为了保持 UI 极端流畅，我们也让它异步运行
    let app_handle = app.clone();
    spawn_blocking(move || is_platform_tools_installed(&app_handle))
        .await
        .unwrap_or(false)
}

/// 获取 ADB 版本（在后台线程执行）
#[tauri::command]
pub async fn get_adb_version(app: AppHandle) -> Result<String, String> {
    let adb_path = get_adb_path(&app).map_err(|e| format!("Failed to get adb path: {}", e))?;

    let result = spawn_blocking(move || {
        let output = Command::new(&adb_path)
            .arg("version")
            .output()
            .map_err(|e| format!("Failed to execute adb: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "ADB command failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))??;

    Ok(result)
}

/// 获取已连接的设备列表（在后台线程执行）
#[tauri::command]
pub async fn get_devices(app: AppHandle) -> Result<Vec<Device>, String> {
    let start = std::time::Instant::now();
    let adb_path = get_adb_path(&app).map_err(|e| format!("Failed to get adb path: {}", e))?;

    // 检查 ADB 路径是否存在，避免不必要的服务器启动
    if !adb_path.exists() {
        return Err(format!("ADB 未找到: {:?}", adb_path));
    }

    let result = spawn_blocking(move || {
        let output = Command::new(&adb_path)
            .arg("devices")
            .output()
            .map_err(|e| format!("Failed to execute adb: {}", e))?;

        let exec_duration = start.elapsed();

        // 性能监控：执行时间过长时记录警告
        if exec_duration.as_secs() > 2 {
            eprintln!("[ADB] ⚠️ 命令执行缓慢: {:?}", exec_duration);
        }

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            eprintln!("[ADB] get_devices: 命令执行失败 - {}", stderr);
            return Err(format!("ADB command failed: {}", stderr));
        }

        let output_str = String::from_utf8_lossy(&output.stdout);
        let devices = parse_devices(&output_str);

        // Debug: Log the final devices array
        eprintln!("[DEBUG] Returning {} devices to frontend", devices.len());
        for device in &devices {
            eprintln!("[DEBUG] Device JSON: {:?}", serde_json::to_string(device));
        }

        Ok(devices)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))??;

    let duration = start.elapsed();

    // 总性能警告：超过 3 秒需要关注
    if duration.as_secs() > 3 {
        eprintln!(
            "[ADB] ⚠️ 性能警告: 总耗时 {:?}，建议检查 ADB 服务器状态",
            duration
        );
    }

    Ok(result)
}

/// 执行任意 ADB 命令（在后台线程执行，避免阻塞 UI）
#[tauri::command]
pub async fn execute_adb_command(app: AppHandle, args: Vec<String>) -> Result<String, String> {
    let start = std::time::Instant::now();
    let adb_path = get_adb_path(&app).map_err(|e| format!("Failed to get adb path: {}", e))?;

    // 克隆 args 用于后续的日志输出
    let args_clone = args.clone();

    // 使用 spawn_blocking 在后台线程执行同步操作
    let result = spawn_blocking(move || {
        let output = Command::new(&adb_path)
            .args(&args)
            .output()
            .map_err(|e| format!("Failed to execute adb: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "ADB command failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))??;

    let duration = start.elapsed();

    // 性能监控：执行时间过长时记录警告
    if duration.as_secs() > 3 {
        eprintln!(
            "[ADB] ⚠️ execute_adb_command 缓慢: {:?} - {:?}",
            args_clone, duration
        );
    }

    Ok(result)
}

/// 关闭 ADB 服务器
/// 在应用退出时调用，清理 ADB 进程
pub fn kill_adb_server(app: &AppHandle) -> Result<(), String> {
    let adb_path = get_adb_path(app).map_err(|e| format!("Failed to get adb path: {}", e))?;

    // 执行 adb kill-server 命令
    let output = Command::new(&adb_path)
        .arg("kill-server")
        .output()
        .map_err(|e| format!("Failed to execute adb kill-server: {}", e))?;

    // 即使命令失败也不返回错误，确保应用能正常退出
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        eprintln!("ADB kill-server warning: {}", stderr);
    }

    Ok(())
}

/// 解析 adb devices 输出
fn parse_devices(output: &str) -> Vec<Device> {
    let mut devices = Vec::new();

    for line in output.lines().skip(1) {
        // 跳过第一行 "List of devices attached"
        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 {
            let device_id = parts[0].to_string();
            let status = parts[1].to_string();

            // 判断连接类型：
            // WiFi: 包含冒号（如 192.168.1.100:5555）或以 ._adb-tls-connect._tcp 结尾
            // USB: 其他情况（设备序列号等）
            let connection_type =
                if device_id.contains(':') || device_id.ends_with("._adb-tls-connect._tcp") {
                    DeviceConnectionType::Wifi
                } else {
                    DeviceConnectionType::Usb
                };

            eprintln!(
                "[DEBUG] Parsed device: id={}, status={}, connection_type={:?}",
                device_id, status, connection_type
            );

            devices.push(Device {
                id: device_id,
                status,
                connection_type,
            });
        }
    }

    devices
}
