use anyhow::{Context, Result};
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::Path;
use tauri::{AppHandle, Manager};
use zip::ZipArchive;

use super::get_platform_tools_dir;

/// 初始化 platform-tools
/// 检查是否已安装，如未安装则从应用资源中提取
pub fn init_platform_tools(app: &AppHandle) -> Result<()> {
    let platform_tools_dir = get_platform_tools_dir(app)?;

    println!("📁 目标安装目录: {:?}", platform_tools_dir);

    // 如果已安装，直接返回
    if platform_tools_dir.exists() && is_valid_installation(&platform_tools_dir) {
        println!("✅ Platform-tools 已安装，跳过初始化");
        return Ok(());
    }

    println!("🚀 开始初始化 platform-tools...");

    // 创建目录
    fs::create_dir_all(&platform_tools_dir).context("Failed to create platform-tools directory")?;

    // 获取对应平台的 zip 文件名
    let zip_name = get_platform_zip_name();

    // 使用 resolve() 方法自动处理开发和生产环境的路径
    // 开发模式：从 src-tauri/resources/ 读取
    // 生产模式：从打包后的资源目录读取
    let resource_path = app
        .path()
        .resolve(
            &format!("resources/{}", zip_name),
            tauri::path::BaseDirectory::Resource,
        )
        .context("Failed to resolve resource path")?;

    println!("📦 资源文件路径: {:?}", resource_path);
    println!("📂 文件是否存在: {}", resource_path.exists());

    // 解压到目标目录
    extract_zip(&resource_path, &platform_tools_dir)?;

    println!("✅ 解压完成");

    // Unix 系统设置可执行权限
    #[cfg(unix)]
    set_executable_permissions(&platform_tools_dir)?;

    println!("🎉 Platform-tools 初始化成功！");

    Ok(())
}

/// 获取当前平台对应的 zip 文件名
fn get_platform_zip_name() -> String {
    #[cfg(target_os = "windows")]
    return "platform-tools-latest-windows.zip".to_string();

    #[cfg(target_os = "macos")]
    return "platform-tools-latest-darwin.zip".to_string();

    #[cfg(target_os = "linux")]
    return "platform-tools-latest-linux.zip".to_string();
}

/// 解压 zip 文件到目标目录
fn extract_zip(zip_path: &Path, target_dir: &Path) -> Result<()> {
    let file =
        File::open(zip_path).with_context(|| format!("Failed to open zip file: {:?}", zip_path))?;

    let mut archive = ZipArchive::new(file).context("Failed to read zip archive")?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).context("Failed to read zip entry")?;

        let outpath = match file.enclosed_name() {
            Some(path) => target_dir.join(path),
            None => continue,
        };

        if file.name().ends_with('/') {
            // 创建目录
            fs::create_dir_all(&outpath)
                .with_context(|| format!("Failed to create directory: {:?}", outpath))?;
        } else {
            // 创建文件
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p)
                        .with_context(|| format!("Failed to create parent directory: {:?}", p))?;
                }
            }

            let mut outfile = File::create(&outpath)
                .with_context(|| format!("Failed to create file: {:?}", outpath))?;

            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer)
                .context("Failed to read file from zip")?;

            outfile
                .write_all(&buffer)
                .with_context(|| format!("Failed to write file: {:?}", outpath))?;
        }
    }

    Ok(())
}

/// 检查安装是否有效（adb 文件存在）
fn is_valid_installation(platform_tools_dir: &Path) -> bool {
    #[cfg(target_os = "windows")]
    let adb_name = "adb.exe";

    #[cfg(not(target_os = "windows"))]
    let adb_name = "adb";

    // 检查 adb 文件是否存在
    // zip 解压后通常有 platform-tools/ 子目录
    let adb_path = platform_tools_dir.join("platform-tools").join(adb_name);
    if adb_path.exists() {
        return true;
    }

    // 也检查直接在根目录的情况
    let adb_path_root = platform_tools_dir.join(adb_name);
    adb_path_root.exists()
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
