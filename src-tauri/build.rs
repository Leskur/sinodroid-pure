use std::env;
use std::fs;

fn main() {
    let target_os = env::var("CARGO_CFG_TARGET_OS").unwrap();
    println!("Target OS: {}", target_os);

    let source_file = match target_os.as_str() {
        "windows" => "assets/platform-tools-latest-windows.zip",
        "macos" => "assets/platform-tools-latest-darwin.zip",
        "linux" => "assets/platform-tools-latest-linux.zip",
        _ => panic!("Unsupported platform"),
    };

    println!("Source file: {}", source_file);

    // 复制到 resources/ 目录（用于生产打包）
    fs::create_dir_all("resources").ok();
    fs::copy(source_file, "resources/platform-tools.zip").ok();

    // 仅在 debug 模式下复制到 target/debug/（开发运行时使用）
    // release 模式下不需要，因为会直接使用打包后的 resources 目录
    let profile = env::var("PROFILE").unwrap();
    if profile == "debug" {
        fs::copy(source_file, "target/debug/platform-tools.zip").ok();
    }

    tauri_build::build()
}
