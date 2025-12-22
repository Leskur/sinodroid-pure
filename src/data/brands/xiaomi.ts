import { type BloatwarePackage } from "./types";

/**
 * 小米/Redmi 预装应用列表
 * 以下应用经过验证可以安全移除，不会影响系统正常使用
 */
export const XIAOMI_PACKAGES: BloatwarePackage[] = [
  // ==================== 广告与追踪服务 ====================
  {
    name: "小米广告服务",
    package: "com.miui.systemAdSolution",
    desc: "系统广告推送服务（智能服务）",
    brand: "Xiaomi",
  },
  {
    name: "系统广告服务",
    package: "com.miui.systemAdService",
    desc: "系统广告投放组件",
    brand: "Xiaomi",
  },
  {
    name: "MSA广告",
    package: "com.miui.msa.global",
    desc: "小米广告SDK服务",
    brand: "Xiaomi",
  },
  {
    name: "数据分析",
    package: "com.miui.analytics",
    desc: "MIUI数据分析收集",
    brand: "Xiaomi",
  },
  {
    name: "后台追踪",
    package: "com.xiaomi.joyose",
    desc: "用户行为追踪服务",
    brand: "Xiaomi",
  },
  {
    name: "系统追踪",
    package: "com.miui.daemon",
    desc: "后台数据收集守护进程",
    brand: "Xiaomi",
  },
  {
    name: "Bug报告",
    package: "com.miui.bugreport",
    desc: "系统Bug上报工具",
    brand: "Xiaomi",
  },
  {
    name: "内容捕获",
    package: "com.miui.contentcatcher",
    desc: "内容分析服务",
    brand: "Xiaomi",
  },

  // ==================== 可替代的工具应用 ====================
  {
    name: "小米浏览器",
    package: "com.android.browser",
    desc: "内置浏览器，可用Chrome等替代",
    brand: "Xiaomi",
  },
  {
    name: "小米音乐",
    package: "com.miui.player",
    desc: "内置音乐播放器",
    brand: "Xiaomi",
  },
  {
    name: "小米视频",
    package: "com.miui.video",
    desc: "内置视频播放器",
    brand: "Xiaomi",
  },
  {
    name: "天气",
    package: "com.miui.weather2",
    desc: "系统天气应用（含广告）",
    brand: "Xiaomi",
  },
  {
    name: "便签",
    package: "com.miui.notes",
    desc: "系统便签应用",
    brand: "Xiaomi",
  },
  {
    name: "录音机",
    package: "com.miui.recorder",
    desc: "系统录音应用",
    brand: "Xiaomi",
  },
  {
    name: "指南针",
    package: "com.miui.compass",
    desc: "系统指南针应用",
    brand: "Xiaomi",
  },
  {
    name: "扫一扫",
    package: "com.miui.scanner",
    desc: "系统扫描应用",
    brand: "Xiaomi",
  },
  {
    name: "屏幕录制",
    package: "com.miui.screenrecorder",
    desc: "系统屏幕录制",
    brand: "Xiaomi",
  },

  // ==================== 小米服务应用 ====================
  {
    name: "智能推荐",
    package: "com.miui.personalassistant",
    desc: "负一屏智能助理（含广告）",
    brand: "Xiaomi",
  },
  {
    name: "黄页",
    package: "com.miui.yellowpage",
    desc: "电话黄页服务",
    brand: "Xiaomi",
  },
  {
    name: "画报壁纸",
    package: "com.miui.android.fashiongallery",
    desc: "锁屏画报/壁纸轮播（广告来源）",
    brand: "Xiaomi",
  },
  {
    name: "全球上网",
    package: "com.miui.virtualsim",
    desc: "虚拟SIM卡上网服务",
    brand: "Xiaomi",
  },
  {
    name: "小米互传",
    package: "com.miui.mishare.connectivity",
    desc: "文件互传服务",
    brand: "Xiaomi",
  },
  {
    name: "Mi Drop",
    package: "com.xiaomi.midrop",
    desc: "文件分享应用",
    brand: "Xiaomi",
  },

  // ==================== 语音与AI服务 ====================
  {
    name: "小爱同学",
    package: "com.miui.voiceassist",
    desc: "语音助手（高耗电）",
    brand: "Xiaomi",
  },
  {
    name: "小爱服务",
    package: "com.xiaomi.aiasst.service",
    desc: "小爱同学后台服务",
    brand: "Xiaomi",
  },
  {
    name: "语音唤醒",
    package: "com.miui.voicetrigger",
    desc: "小爱语音唤醒服务",
    brand: "Xiaomi",
  },

  // ==================== 游戏相关 ====================
  {
    name: "游戏中心",
    package: "com.xiaomi.gamecenter",
    desc: "小米游戏下载中心",
    brand: "Xiaomi",
  },
  {
    name: "游戏服务",
    package: "com.xiaomi.gamecenter.sdk.service",
    desc: "游戏SDK服务",
    brand: "Xiaomi",
  },
  {
    name: "游戏服务",
    package: "com.xiaomi.migameservice",
    desc: "游戏加速服务",
    brand: "Xiaomi",
  },

  // ==================== 支付与金融 ====================
  {
    name: "小米支付",
    package: "com.miui.nextpay",
    desc: "小米支付服务",
    brand: "Xiaomi",
  },
  {
    name: "米币支付",
    package: "com.miui.payment",
    desc: "米币支付组件",
    brand: "Xiaomi",
  },
  {
    name: "小米钱包",
    package: "com.mipay.wallet",
    desc: "小米钱包应用",
    brand: "Xiaomi",
  },
  {
    name: "智能卡",
    package: "com.miui.tsmclient",
    desc: "门禁/公交卡服务",
    brand: "Xiaomi",
  },

  // ==================== 连接与投屏 ====================
  {
    name: "互联服务",
    package: "com.xiaomi.mi_connect_service",
    desc: "小米设备互联服务",
    brand: "Xiaomi",
  },
  {
    name: "投屏",
    package: "com.xiaomi.miplay_client",
    desc: "投屏服务客户端",
    brand: "Xiaomi",
  },

  // ==================== 翻译服务 ====================
  {
    name: "有道翻译",
    package: "com.miui.translation.youdao",
    desc: "有道翻译引擎",
    brand: "Xiaomi",
  },
  {
    name: "金山翻译",
    package: "com.miui.translation.kingsoft",
    desc: "金山翻译引擎",
    brand: "Xiaomi",
  },
  {
    name: "翻译服务",
    package: "com.miui.translation.service",
    desc: "系统翻译服务",
    brand: "Xiaomi",
  },

  // ==================== 云服务与备份 ====================
  {
    name: "小米云服务",
    package: "com.miui.cloudservice",
    desc: "小米云同步服务",
    brand: "Xiaomi",
  },
  {
    name: "云备份",
    package: "com.miui.cloudbackup",
    desc: "云端备份服务",
    brand: "Xiaomi",
  },
  {
    name: "本地备份",
    package: "com.miui.backup",
    desc: "本地数据备份",
    brand: "Xiaomi",
  },

  // ==================== 其他可移除服务 ====================
  {
    name: "网络短信",
    package: "com.xiaomi.mircs",
    desc: "富媒体短信服务",
    brand: "Xiaomi",
  },
  {
    name: "SIM激活",
    package: "com.xiaomi.simactivate.service",
    desc: "SIM卡激活服务",
    brand: "Xiaomi",
  },
  {
    name: "自由窗口",
    package: "com.miui.freeform",
    desc: "小窗模式服务",
    brand: "Xiaomi",
  },
  {
    name: "无障碍",
    package: "com.miui.accessibility",
    desc: "无障碍/闻声服务",
    brand: "Xiaomi",
  },
  {
    name: "主屏提示",
    package: "com.android.protips",
    desc: "桌面使用提示",
    brand: "Xiaomi",
  },
  {
    name: "互动屏保",
    package: "com.android.dreams.basic",
    desc: "基本屏保服务",
    brand: "Xiaomi",
  },
  {
    name: "清理大师",
    package: "com.miui.cleanmaster",
    desc: "清理工具（含广告）",
    brand: "Xiaomi",
  },
  {
    name: "打印服务",
    package: "com.android.printspooler",
    desc: "系统打印服务",
    brand: "Xiaomi",
  },
];
