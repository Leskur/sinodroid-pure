/**
 * 预装应用列表模块
 * 数据按品牌分别维护在 brands/ 目录下
 */

// 导出类型定义
export { type BloatwarePackage } from "./brands";

// 导入所有品牌数据
import { ALL_BRAND_PACKAGES, type BloatwarePackage } from "./brands";

/**
 * 所有预装应用列表（向后兼容）
 */
export const BLOATWARE_PACKAGES: BloatwarePackage[] = ALL_BRAND_PACKAGES;

/**
 * 按品牌获取预装应用
 * @param brand 品牌名称（如 "Xiaomi", "Huawei"）
 * @returns 该品牌的应用列表
 */
export function getPackagesByBrand(brand: string): BloatwarePackage[] {
  return BLOATWARE_PACKAGES.filter((pkg) => pkg.brand === brand);
}

/**
 * 搜索预装应用
 * @param keyword 关键词（支持包名、名称、描述）
 * @returns 匹配的应用列表
 */
export function searchPackages(keyword: string): BloatwarePackage[] {
  const lowerKeyword = keyword.toLowerCase();
  return BLOATWARE_PACKAGES.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(lowerKeyword) ||
      pkg.package.toLowerCase().includes(lowerKeyword) ||
      pkg.desc.toLowerCase().includes(lowerKeyword) ||
      pkg.brand.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * 获取所有支持的品牌
 * @returns 品牌列表
 */
export function getAllBrands(): string[] {
  const brands = new Set(BLOATWARE_PACKAGES.map((pkg) => pkg.brand));
  return Array.from(brands).sort();
}

/**
 * 获取应用总数
 */
export const TOTAL_BLOATWARE_COUNT = BLOATWARE_PACKAGES.length;

/**
 * 按品牌分组的应用
 */
export const PACKAGES_BY_BRAND = BLOATWARE_PACKAGES.reduce((acc, pkg) => {
  if (!acc[pkg.brand]) {
    acc[pkg.brand] = [];
  }
  acc[pkg.brand].push(pkg);
  return acc;
}, {} as Record<string, BloatwarePackage[]>);
