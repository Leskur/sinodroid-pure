use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::AppHandle;

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

/// 获取 ADB 版本
#[tauri::command]
pub fn get_adb_version(app: AppHandle) -> Result<String, String> {
    let adb_path = get_adb_path(&app).map_err(|e| format!("Failed to get adb path: {}", e))?;

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

    let version = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(version)
}

/// 获取已连接的设备列表
#[tauri::command]
pub fn get_devices(app: AppHandle) -> Result<Vec<Device>, String> {
    let adb_path = get_adb_path(&app).map_err(|e| format!("Failed to get adb path: {}", e))?;

    let output = Command::new(&adb_path)
        .arg("devices")
        .output()
        .map_err(|e| format!("Failed to execute adb: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "ADB command failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let output_str = String::from_utf8_lossy(&output.stdout);
    let devices = parse_devices(&output_str);

    Ok(devices)
}

/// 执行任意 ADB 命令
#[tauri::command]
pub fn execute_adb_command(app: AppHandle, args: Vec<String>) -> Result<String, String> {
    let adb_path = get_adb_path(&app).map_err(|e| format!("Failed to get adb path: {}", e))?;

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

    let result = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(result)
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
