import { XIAOMI_PACKAGES } from "./brands/xiaomi";
import { HUAWEI_PACKAGES } from "./brands/huawei";
import { OPPO_PACKAGES } from "./brands/oppo";
import { VIVO_PACKAGES } from "./brands/vivo";

/**
 * 包名到应用信息的映射表
 */
export interface AppInfo {
  name: string;
  desc: string;
}

// 创建包名到应用信息的映射
const packageNameMap = new Map<string, AppInfo>();

// 初始化所有品牌应用映射
const ALL_PACKAGES = [
  ...XIAOMI_PACKAGES,
  ...HUAWEI_PACKAGES,
  ...OPPO_PACKAGES,
  ...VIVO_PACKAGES,
];

for (const pkg of ALL_PACKAGES) {
  if (!pkg.package) continue;
  packageNameMap.set(pkg.package, {
    name: pkg.name,
    desc: pkg.desc,
  });
}

/**
 * 根据包名获取应用信息
 * @param packageName 包名
 * @returns 应用信息，如果找不到则返回 null
 */
export function getAppInfo(packageName: string): AppInfo | null {
  return packageNameMap.get(packageName) || null;
}

/**
 * 根据包名获取应用名称
 * @param packageName 包名
 * @returns 应用名称，如果找不到则从包名生成
 */
export function getAppName(packageName: string): string {
  const info = packageNameMap.get(packageName);
  if (info) {
    return info.name;
  }
  // 从包名生成显示名称
  // 例如 com.miui.touchassistant -> touchassistant -> Touch Assistant
  const lastPart = packageName.split(".").pop() || packageName;
  return lastPart
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * 根据包名获取应用描述
 * @param packageName 包名
 * @returns 应用描述，如果找不到则返回空字符串
 */
export function getAppDesc(packageName: string): string {
  const info = packageNameMap.get(packageName);
  return info?.desc || "";
}

// 导出原有内容以保持兼容性
// 导出原有内容以保持兼容性
export { XIAOMI_PACKAGES };
export { HUAWEI_PACKAGES };
export { OPPO_PACKAGES };
export { VIVO_PACKAGES };
export type { BloatwarePackage } from "./brands/types";

// 合并所有品牌的包列表
import type { BloatwarePackage } from "./brands/types";

export const BLOATWARE_PACKAGES: BloatwarePackage[] = [
  ...XIAOMI_PACKAGES,
  ...HUAWEI_PACKAGES,
  ...OPPO_PACKAGES,
  ...VIVO_PACKAGES,
];
