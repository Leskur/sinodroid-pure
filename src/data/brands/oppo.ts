import { type BloatwarePackage } from "./types";

/**
 * OPPO 预装应用列表
 */
export const OPPO_PACKAGES: BloatwarePackage[] = [
  {
    name: "OPPO 推送服务",
    package: "com.oppo.pushservice",
    desc: "OPPO 推送广告",
    brand: "OPPO",
  },
  {
    name: "OPPO 桌面广告",
    package: "com.oppo.launcher.res",
    desc: "OPPO 桌面广告",
    brand: "OPPO",
  },
];
