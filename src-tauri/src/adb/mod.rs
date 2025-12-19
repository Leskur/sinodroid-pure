use anyhow::{Context, Result};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub mod commands;
pub mod installer;

/// 获取 platform-tools 安装目录
/// 使用 Tauri 的应用数据目录：
/// - Windows: C:\Users\[用户]\AppData\Local\sinodroid-pure\platform-tools
/// - macOS: ~/Library/Application Support/sinodroid-pure/platform-tools
/// - Linux: ~/.local/share/sinodroid-pure/platform-tools
pub fn get_platform_tools_dir(app: &AppHandle) -> Result<PathBuf> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .context("Failed to get app data directory")?;

    Ok(app_data_dir.join("platform-tools"))
}

/// 获取 adb 可执行文件路径
pub fn get_adb_path(app: &AppHandle) -> Result<PathBuf> {
    let platform_tools_dir = get_platform_tools_dir(app)?;

    // 根据操作系统返回正确的可执行文件名
    #[cfg(target_os = "windows")]
    let adb_name = "adb.exe";

    #[cfg(not(target_os = "windows"))]
    let adb_name = "adb";

    Ok(platform_tools_dir.join(adb_name))
}

/// 检查 platform-tools 是否已安装且有效
pub fn is_platform_tools_installed(app: &AppHandle) -> bool {
    match get_adb_path(app) {
        Ok(adb_path) => adb_path.exists(),
        Err(_) => false,
    }
}
