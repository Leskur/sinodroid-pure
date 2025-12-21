use anyhow::{Context, Result};
use std::fs::File;
use tauri::{AppHandle, Manager};
use zip_extract::extract;

use super::get_platform_tools_dir;

/// 初始化 platform-tools
/// 检查是否已安装，如未安装则从应用资源中提取
pub fn init_platform_tools(app: &AppHandle) -> Result<()> {
    eprintln!("[INIT] 开始初始化 platform-tools");
    let start = std::time::Instant::now();
    let platform_tools_dir = get_platform_tools_dir(app)?;

    let resource_path = app
        .path()
        .resolve("platform-tools.zip", tauri::path::BaseDirectory::Resource)
        .context("Failed to resolve resource path")?;

    eprintln!("[INIT] 解压 platform-tools.zip...");
    let file = File::open(&resource_path).context("Failed to open zip file")?;
    extract(
        file,
        platform_tools_dir
            .parent()
            .expect("Failed to get parent directory"),
        false,
    )?;

    // Unix 系统设置可执行权限
    #[cfg(unix)]
    set_executable_permissions(&platform_tools_dir)?;

    let duration = start.elapsed();
    eprintln!("[INIT] platform-tools 初始化完成 - {:?}", duration);
    Ok(())
}

/// Unix 系统设置可执行权限
#[cfg(unix)]
fn set_executable_permissions(platform_tools_dir: &Path) -> Result<()> {
    use std::os::unix::fs::PermissionsExt;

    // 需要设置执行权限的文件
    let executables = ["adb", "fastboot"];

    for &exe in &executables {
        // 检查两个可能的位置
        let paths = [
            platform_tools_dir.join("platform-tools").join(exe),
            platform_tools_dir.join(exe),
        ];

        for path in &paths {
            if path.exists() {
                let mut perms = fs::metadata(path)?.permissions();
                perms.set_mode(0o755); // rwxr-xr-x
                fs::set_permissions(path, perms)?;
            }
        }
    }

    Ok(())
}
