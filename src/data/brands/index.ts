/**
 * 品牌预装应用汇总导出
 * 添加新品牌时，只需：
 * 1. 创建新的品牌文件（如 samsung.ts）
 * 2. 在此处导入并添加到 ALL_BRAND_PACKAGES
 */

export { type BloatwarePackage } from "./types";
export { XIAOMI_PACKAGES } from "./xiaomi";
export { HUAWEI_PACKAGES } from "./huawei";
export { OPPO_PACKAGES } from "./oppo";
export { VIVO_PACKAGES } from "./vivo";

import { XIAOMI_PACKAGES } from "./xiaomi";
import { HUAWEI_PACKAGES } from "./huawei";
import { OPPO_PACKAGES } from "./oppo";
import { VIVO_PACKAGES } from "./vivo";

/**
 * 所有品牌的预装应用合并列表
 */
export const ALL_BRAND_PACKAGES = [
  ...XIAOMI_PACKAGES,
  ...HUAWEI_PACKAGES,
  ...OPPO_PACKAGES,
  ...VIVO_PACKAGES,
];
