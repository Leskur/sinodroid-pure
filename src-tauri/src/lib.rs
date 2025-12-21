// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// ADB 模块
mod adb;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            adb::commands::init_platform_tools,
            adb::commands::is_platform_tools_ready,
            adb::commands::get_adb_version,
            adb::commands::get_devices,
            adb::commands::execute_adb_command,
        ])
        .on_window_event(|window, event| {
            // 在窗口关闭时关闭 ADB 服务器
            if let tauri::WindowEvent::Destroyed = event {
                let app = window.app_handle();
                if let Err(e) = adb::commands::kill_adb_server(app) {
                    eprintln!("Failed to kill ADB server: {}", e);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
