use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::AppHandle;
use tokio::task::spawn_blocking;

use super::{get_adb_path, installer, is_platform_tools_installed};

/// 设备信息
#[derive(Debug, Serialize, Deserialize)]
pub struct Device {
    pub id: String,
    pub status: String,
}

/// 初始化 platform-tools
#[tauri::command]
pub fn init_platform_tools(app: AppHandle) -> Result<(), String> {
    installer::init_platform_tools(&app)
        .map_err(|e| format!("Failed to initialize platform-tools: {}", e))
}

/// 检查 platform-tools 是否已安装
#[tauri::command]
pub fn is_platform_tools_ready(app: AppHandle) -> bool {
    is_platform_tools_installed(&app)
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
    eprintln!("[ADB] get_devices: 开始执行");
    let start = std::time::Instant::now();

    let path_start = std::time::Instant::now();
    let adb_path = get_adb_path(&app).map_err(|e| format!("Failed to get adb path: {}", e))?;
    eprintln!("[ADB] get_devices: 获取adb路径 - {:?}", path_start.elapsed());

    // 检查 ADB 路径是否存在，避免不必要的服务器启动
    if !adb_path.exists() {
        return Err(format!("ADB 未找到: {:?}", adb_path));
    }

    let result = spawn_blocking(move || {
        let exec_start = std::time::Instant::now();
        let output = Command::new(&adb_path)
            .arg("devices")
            .output()
            .map_err(|e| format!("Failed to execute adb: {}", e))?;

        let exec_duration = exec_start.elapsed();
        eprintln!("[ADB] get_devices: 命令执行完成 - {:?}", exec_duration);

        // 如果执行时间过长，记录警告
        if exec_duration.as_secs() > 2 {
            eprintln!("[ADB] ⚠️ 命令执行缓慢: {:?}", exec_duration);
        }

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            eprintln!("[ADB] get_devices: 命令执行失败 - {}", stderr);
            return Err(format!("ADB command failed: {}", stderr));
        }

        let parse_start = std::time::Instant::now();
        let output_str = String::from_utf8_lossy(&output.stdout);
        let devices = parse_devices(&output_str);
        eprintln!("[ADB] get_devices: 解析完成 - {:?}, 输出: {}", parse_start.elapsed(), output_str.trim());
        Ok(devices)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))??;

    let duration = start.elapsed();
    eprintln!("[ADB] get_devices: 完成 - {:?} - {} 台设备", duration, result.len());

    // 总性能建议
    if duration.as_secs() > 3 {
        eprintln!("[ADB] ⚠️ 性能警告: 总耗时 {:?}，建议检查 ADB 服务器状态", duration);
    }

    Ok(result)
}

/// 执行任意 ADB 命令（在后台线程执行，避免阻塞 UI）
#[tauri::command]
pub async fn execute_adb_command(app: AppHandle, args: Vec<String>) -> Result<String, String> {
    let start = std::time::Instant::now();
    let cmd_display = args.join(" ");
    eprintln!("[ADB] execute: {}", cmd_display);
    let adb_path = get_adb_path(&app).map_err(|e| format!("Failed to get adb path: {}", e))?;

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
    eprintln!("[ADB] execute done: {} - {:?}", cmd_display, duration);
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
            devices.push(Device {
                id: parts[0].to_string(),
                status: parts[1].to_string(),
            });
        }
    }

    devices
}
