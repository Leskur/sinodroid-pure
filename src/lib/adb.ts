import { invoke } from "@tauri-apps/api/core";

/**
 * 设备连接类型
 */
export type DeviceConnectionType = "usb" | "wifi";

/**
 * 设备信息接口
 */
export interface Device {
  id: string;
  status: string;
  connectionType: DeviceConnectionType;
}

/**
 * 初始化 platform-tools
 * 首次启动时会从应用资源中解压到用户目录
 */
export async function initPlatformTools(): Promise<void> {
  return await invoke("init_platform_tools");
}

/**
 * 检查 platform-tools 是否已安装并准备就绪
 */
export async function isPlatformToolsReady(): Promise<boolean> {
  return await invoke("is_platform_tools_ready");
}

/**
 * 获取 ADB 版本信息
 */
export async function getAdbVersion(): Promise<string> {
  return await invoke("get_adb_version");
}

/**
 * 获取已连接的设备列表
 */
export async function getDevices(): Promise<Device[]> {
  return await invoke("get_devices");
}

/**
 * 执行任意 ADB 命令
 * @param args - ADB 命令参数数组，例如 ['shell', 'ls']
 */
export async function executeAdbCommand(args: string[]): Promise<string> {
  return await invoke("execute_adb_command", { args });
}
