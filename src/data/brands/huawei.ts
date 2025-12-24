import { type BloatwarePackage } from "./types";

/**
 * 华为 预装应用列表
 */
export const HUAWEI_PACKAGES: BloatwarePackage[] = [
  {
    name: "华为彩信广告",
    package: "com.huawei.android.hwouc",
    desc: "华为系统更新广告",
    brand: "Huawei",
  },
  {
    name: "华为智能推荐",
    package: "com.huawei.android.hwSmartAds",
    desc: "华为智能广告",
    brand: "Huawei",
  },
];
