// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
