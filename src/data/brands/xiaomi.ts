import { type BloatwarePackage } from "./types";

/**
 * 小米/Redmi 预装应用列表
 * 参考来源：
 * - https://miuiver.com/wp-content/uploads/miui-pre-installed-software.html
 * - 通过 ADB 命令从 /system/app/ 和 /product/app/ 目录提取
 * 仅包含小米系统应用，不含第三方预装应用
 */
export const XIAOMI_PACKAGES: BloatwarePackage[] = [
  // ==================== 系统核心组件 ====================
  {
    name: "系统核心",
    package: "com.miui.core",
    desc: "MIUI 核心服务",
    brand: "Xiaomi",
  },
  {
    name: "XMSF守护",
    package: "com.xiaomi.xmsfkeeper",
    desc: "XMSF 守护服务",
    brand: "Xiaomi",
  },
  {
    name: "系统组件",
    package: "com.xiaomi.ab",
    desc: "系统基础组件",
    brand: "Xiaomi",
  },
  {
    name: "系统UI插件",
    package: "miui.systemui.plugin",
    desc: "系统 UI 插件",
    brand: "Xiaomi",
  },

  // ==================== 广告与数据追踪 ====================
  {
    name: "智能服务",
    package: "com.miui.systemAdSolution",
    desc: "系统广告核心",
    brand: "Xiaomi",
  },
  {
    name: "Analytics",
    package: "com.miui.analytics",
    desc: "数据采集分析",
    brand: "Xiaomi",
  },
  {
    name: "MiuiDaemon",
    package: "com.miui.daemon",
    desc: "后台数据采集",
    brand: "Xiaomi",
  },
  {
    name: "Joyose",
    package: "com.xiaomi.joyose",
    desc: "温控/行为追踪",
    brand: "Xiaomi",
  },
  {
    name: "CatchLog",
    package: "com.bsp.catchlog",
    desc: "日志采集服务",
    brand: "Xiaomi",
  },
  {
    name: "用户反馈",
    package: "com.miui.bugreport",
    desc: "Bug 上报工具",
    brand: "Xiaomi",
  },
  {
    name: "三方应用异常分析",
    package: "com.miui.thirdappassistant",
    desc: "第三方应用分析",
    brand: "Xiaomi",
  },

  // ==================== 小米服务应用 ====================
  {
    name: "小米商城",
    package: "com.xiaomi.shop",
    desc: "购物商城",
    brand: "Xiaomi",
  },
  {
    name: "小米有品",
    package: "com.xiaomi.youpin",
    desc: "精品电商",
    brand: "Xiaomi",
  },
  {
    name: "小米社区",
    package: "com.xiaomi.vipaccount",
    desc: "用户社区",
    brand: "Xiaomi",
  },
  {
    name: "小米直播助手",
    package: "com.mi.liveassistant",
    desc: "直播工具",
    brand: "Xiaomi",
  },
  {
    name: "小米画报",
    package: "com.mfashiongallery.emag",
    desc: "锁屏画报/广告",
    brand: "Xiaomi",
  },
  {
    name: "内容中心",
    package: "com.miui.newhome",
    desc: "资讯聚合（广告）",
    brand: "Xiaomi",
  },
  {
    name: "天星金融",
    package: "com.xiaomi.jr",
    desc: "金融服务（广告）",
    brand: "Xiaomi",
  },
  {
    name: "生活黄页",
    package: "com.miui.yellowpage",
    desc: "电话黄页",
    brand: "Xiaomi",
  },
  {
    name: "智能助理",
    package: "com.miui.personalassistant",
    desc: "负一屏推荐",
    brand: "Xiaomi",
  },
  {
    name: "智能出行",
    package: "com.miui.smarttravel",
    desc: "出行服务",
    brand: "Xiaomi",
  },
  {
    name: "快应用服务框架",
    package: "com.miui.hybrid",
    desc: "快应用框架（广告）",
    brand: "Xiaomi",
  },
  {
    name: "服务与反馈",
    package: "com.miui.miservice",
    desc: "用户服务",
    brand: "Xiaomi",
  },

  // ==================== 游戏相关 ====================
  {
    name: "游戏中心",
    package: "com.xiaomi.gamecenter",
    desc: "游戏下载中心",
    brand: "Xiaomi",
  },
  {
    name: "游戏服务",
    package: "com.xiaomi.gamecenter.sdk.service",
    desc: "游戏 SDK",
    brand: "Xiaomi",
  },

  // ==================== 可替代的系统应用 ====================
  {
    name: "浏览器",
    package: "com.android.browser",
    desc: "MIUI 浏览器",
    brand: "Xiaomi",
  },
  {
    name: "音乐",
    package: "com.miui.player",
    desc: "小米音乐（广告）",
    brand: "Xiaomi",
  },
  {
    name: "小米视频",
    package: "com.miui.video",
    desc: "小米视频（广告）",
    brand: "Xiaomi",
  },
  {
    name: "天气",
    package: "com.miui.weather2",
    desc: "天气应用",
    brand: "Xiaomi",
  },
  {
    name: "阅读",
    package: "com.duokan.reader",
    desc: "多看阅读器",
    brand: "Xiaomi",
  },
  {
    name: "电子邮件",
    package: "com.android.email",
    desc: "邮件应用",
    brand: "Xiaomi",
  },
  {
    name: "小米文档查看器",
    package: "cn.wps.moffice_eng.xiaomi.lite",
    desc: "文档查看器",
    brand: "Xiaomi",
  },

  // ==================== 语音与AI服务 ====================
  {
    name: "小爱同学",
    package: "com.miui.voiceassist",
    desc: "语音助手",
    brand: "Xiaomi",
  },
  {
    name: "AI虚拟助手",
    package: "com.xiaomi.aiasst.service",
    desc: "AI 助手服务",
    brand: "Xiaomi",
  },
  {
    name: "语音唤醒",
    package: "com.miui.voicetrigger",
    desc: "语音唤醒服务",
    brand: "Xiaomi",
  },

  // ==================== 支付与金融 ====================
  {
    name: "小米支付",
    package: "com.miui.nextpay",
    desc: "支付服务",
    brand: "Xiaomi",
  },
  {
    name: "米币支付",
    package: "com.xiaomi.payment",
    desc: "米币支付",
    brand: "Xiaomi",
  },
  {
    name: "小米钱包",
    package: "com.mipay.wallet",
    desc: "钱包应用",
    brand: "Xiaomi",
  },

  // ==================== 连接与投屏 ====================
  {
    name: "投屏",
    package: "com.milink.service",
    desc: "投屏服务",
    brand: "Xiaomi",
  },
  {
    name: "投屏服务",
    package: "com.xiaomi.miplay_client",
    desc: "投屏客户端",
    brand: "Xiaomi",
  },
  {
    name: "MIUI+",
    package: "com.xiaomi.mirror",
    desc: "MIUI+ Beta",
    brand: "Xiaomi",
  },

  // ==================== 工具类（可选禁用） ====================
  {
    name: "万能遥控",
    package: "com.duokan.phone.remotecontroller",
    desc: "红外遥控",
    brand: "Xiaomi",
  },
  {
    name: "传送门",
    package: "com.miui.contentextension",
    desc: "内容识别",
    brand: "Xiaomi",
  },
  {
    name: "健康",
    package: "com.mi.health",
    desc: "健康应用",
    brand: "Xiaomi",
  },
  {
    name: "全球上网",
    package: "com.miui.virtualsim",
    desc: "虚拟 SIM 卡",
    brand: "Xiaomi",
  },
  {
    name: "小米云盘",
    package: "com.miui.newmidrive",
    desc: "云盘存储",
    brand: "Xiaomi",
  },
  {
    name: "小米换机",
    package: "com.miui.huanji",
    desc: "数据迁移",
    brand: "Xiaomi",
  },
  {
    name: "扫一扫",
    package: "com.xiaomi.scanner",
    desc: "扫描工具",
    brand: "Xiaomi",
  },
  {
    name: "悬浮球",
    package: "com.miui.touchassistant",
    desc: "悬浮快捷操作",
    brand: "Xiaomi",
  },
  {
    name: "智慧生活",
    package: "com.miui.hybrid.accessory",
    desc: "智能设备连接",
    brand: "Xiaomi",
  },
  {
    name: "米家",
    package: "com.xiaomi.smarthome",
    desc: "智能家居控制",
    brand: "Xiaomi",
  },
  {
    name: "收音机",
    package: "com.miui.fm",
    desc: "FM 收音机",
    brand: "Xiaomi",
  },
  {
    name: "收音机调频服务",
    package: "com.miui.fmservice",
    desc: "FM 调频服务",
    brand: "Xiaomi",
  },
  {
    name: "驾车场景",
    package: "com.xiaomi.drivemode",
    desc: "驾车模式",
    brand: "Xiaomi",
  },

  // ==================== 其他可禁用服务 ====================
  {
    name: "主屏幕提示",
    package: "com.android.protips",
    desc: "桌面提示",
    brand: "Xiaomi",
  },
  {
    name: "基本互动屏保",
    package: "com.android.dreams.basic",
    desc: "基本屏保",
    brand: "Xiaomi",
  },
  {
    name: "照片屏幕保护程序",
    package: "com.android.dreams.phototable",
    desc: "照片屏保",
    brand: "Xiaomi",
  },
  {
    name: "打印处理服务",
    package: "com.android.printspooler",
    desc: "打印服务",
    brand: "Xiaomi",
  },
  {
    name: "系统打印服务",
    package: "com.android.bips",
    desc: "打印组件",
    brand: "Xiaomi",
  },

  // ==================== 新增：从 /system/app/ 和 /product/app/ 提取 ====================
  // ==================== 安全与权限 ====================
  {
    name: "安全核心增强",
    package: "com.miui.securitycore",
    desc: "系统安全核心",
    brand: "Xiaomi",
  },
  {
    name: "安全增强",
    package: "com.miui.securityadd",
    desc: "安全增强功能",
    brand: "Xiaomi",
  },
  {
    name: "安全输入法",
    package: "com.miui.securityinputmethod",
    desc: "安全键盘服务",
    brand: "Xiaomi",
  },
  {
    name: "权限管理",
    package: "com.lbe.security.miui",
    desc: "应用权限管理",
    brand: "Xiaomi",
  },
  {
    name: "安全追踪",
    package: "com.xiaomi.security.onetrack",
    desc: "安全数据追踪",
    brand: "Xiaomi",
  },
  {
    name: "信任服务",
    package: "com.xiaomi.trustservice",
    desc: "设备信任服务",
    brand: "Xiaomi",
  },
  {
    name: "凭证管理器",
    package: "com.android.credentialmanager",
    desc: "密码/指纹管理",
    brand: "Xiaomi",
  },

  // ==================== 云服务与同步 ====================
  {
    name: "云服务",
    package: "com.miui.cloudservice",
    desc: "小米云服务",
    brand: "Xiaomi",
  },
  {
    name: "云备份",
    package: "com.miui.cloudbackup",
    desc: "云端备份数据",
    brand: "Xiaomi",
  },
  {
    name: "云同步",
    package: "com.miui.micloudsync",
    desc: "同步联系人/日历等",
    brand: "Xiaomi",
  },
  {
    name: "查找设备",
    package: "com.miui.findmy",
    desc: "定位/锁定手机",
    brand: "Xiaomi",
  },
  {
    name: "小米云SDK",
    package: "com.xiaomi.micloud.sdk",
    desc: "云服务 SDK",
    brand: "Xiaomi",
  },

  // ==================== AI与语音服务 ====================
  {
    name: "小爱语音引擎",
    package: "com.xiaomi.mibrain.speech",
    desc: "语音识别引擎",
    brand: "Xiaomi",
  },
  {
    name: "小爱推荐",
    package: "com.xiaomi.aireco",
    desc: "智能推荐服务",
    brand: "Xiaomi",
  },
  {
    name: "语音助手代理",
    package: "com.miui.voiceassistProxy",
    desc: "小爱助手代理",
    brand: "Xiaomi",
  },
  {
    name: "AI助手视觉",
    package: "com.xiaomi.aiasst.vision",
    desc: "AI 视觉识别",
    brand: "Xiaomi",
  },

  // ==================== 通讯与连接 ====================
  {
    name: "超级通信",
    package: "com.xiaomi.hypercomm",
    desc: "高级通信服务",
    brand: "Xiaomi",
  },
  {
    name: "小米连接服务",
    package: "com.xiaomi.mi_connect_service",
    desc: "设备互联服务",
    brand: "Xiaomi",
  },
  {
    name: "蓝牙扩展",
    package: "com.xiaomi.bluetooth",
    desc: "蓝牙增强功能",
    brand: "Xiaomi",
  },
  {
    name: "连续性SDK",
    package: "com.xiaomi.continuity.sdkapp",
    desc: "多设备协同",
    brand: "Xiaomi",
  },

  // ==================== 定位与位置 ====================
  {
    name: "融合定位",
    package: "com.xiaomi.location.fused",
    desc: "GPS/WiFi 定位",
    brand: "Xiaomi",
  },
  {
    name: "米拓定位",
    package: "com.xiaomi.metoknlp",
    desc: "高精度定位",
    brand: "Xiaomi",
  },
  {
    name: "GNSS极化",
    package: "com.xiaomi.gnss.polaris",
    desc: "卫星定位增强",
    brand: "Xiaomi",
  },

  // ==================== 支付与金融 ====================
  {
    name: "TSM客户端",
    package: "com.miui.tsmclient",
    desc: "公交卡/门禁卡",
    brand: "Xiaomi",
  },
  {
    name: "OTrP代理",
    package: "com.xiaomi.otrpbroker",
    desc: "支付代理服务",
    brand: "Xiaomi",
  },

  // ==================== 工具与辅助 ====================
  {
    name: "工具箱",
    package: "com.xiaomi.app.toolbox",
    desc: "应用工具集合",
    brand: "Xiaomi",
  },
  {
    name: "常用语",
    package: "com.miui.phrase",
    desc: "快捷短语输入",
    brand: "Xiaomi",
  },
  {
    name: "内容捕获",
    package: "com.miui.contentcatcher",
    desc: "文本识别服务",
    brand: "Xiaomi",
  },
  {
    name: "无障碍",
    package: "com.miui.accessibility",
    desc: "辅助功能服务",
    brand: "Xiaomi",
  },
  {
    name: "通知中心",
    package: "com.miui.notification",
    desc: "通知管理服务",
    brand: "Xiaomi",
  },
  {
    name: "设备信息二维码",
    package: "com.miui.qr",
    desc: "设备信息二维码",
    brand: "Xiaomi",
  },
  {
    name: "自动注册",
    package: "com.xiaomi.registration",
    desc: "自动注册服务",
    brand: "Xiaomi",
  },
  {
    name: "注册服务",
    package: "com.miui.dmregservice",
    desc: "设备注册服务",
    brand: "Xiaomi",
  },

  // ==================== 多媒体 ====================
  {
    name: "相机工具",
    package: "com.xiaomi.cameratools",
    desc: "相机辅助工具",
    brand: "Xiaomi",
  },
  {
    name: "相机思维",
    package: "com.xiaomi.cameramind",
    desc: "智能相机服务",
    brand: "Xiaomi",
  },
  {
    name: "额外照片",
    package: "com.miui.extraphoto",
    desc: "照片增强功能",
    brand: "Xiaomi",
  },
  {
    name: "媒体查看器",
    package: "com.miui.mediaviewer",
    desc: "媒体文件查看",
    brand: "Xiaomi",
  },
  {
    name: "小米音效",
    package: "com.miui.misound",
    desc: "音效增强服务",
    brand: "Xiaomi",
  },
  {
    name: "音频监控",
    package: "com.miui.audiomonitor",
    desc: "音频监控服务",
    brand: "Xiaomi",
  },

  // ==================== 系统UI与界面 ====================
  {
    name: "息屏显示",
    package: "com.miui.aod",
    desc: "锁屏显示服务",
    brand: "Xiaomi",
  },
  {
    name: "桌面启动器",
    package: "com.miui.home",
    desc: "桌面主屏幕",
    brand: "Xiaomi",
  },
  {
    name: "绿色守护",
    package: "com.miui.greenguard",
    desc: "省电/健康服务",
    brand: "Xiaomi",
  },
  {
    name: "电量洞察",
    package: "com.miui.powerinsight",
    desc: "电量分析服务",
    brand: "Xiaomi",
  },
  {
    name: "电量守护",
    package: "com.miui.powerkeeper",
    desc: "电池优化服务",
    brand: "Xiaomi",
  },

  // ==================== 游戏与性能 ====================
  {
    name: "游戏服务AI",
    package: "com.xiaomi.migameservice",
    desc: "游戏优化服务",
    brand: "Xiaomi",
  },
  {
    name: "AON服务",
    package: "com.xiaomi.aon",
    desc: "常亮显示服务",
    brand: "Xiaomi",
  },

  // ==================== 输入法 ====================
  {
    name: "搜狗输入法小米版",
    package: "com.sohu.inputmethod.sogou.xiaomi",
    desc: "预装输入法",
    brand: "Xiaomi",
  },

  // ==================== 其他服务 ====================
  {
    name: "工厂测试",
    package: "com.miui.cit",
    desc: "硬件测试服务",
    brand: "Xiaomi",
  },
  {
    name: "虚拟SIM卡核心",
    package: "com.miui.vsimcore",
    desc: "虚拟 SIM 卡",
    brand: "Xiaomi",
  },
  {
    name: "备份服务",
    package: "com.miui.backup",
    desc: "数据备份服务",
    brand: "Xiaomi",
  },
  {
    name: "短信服务",
    package: "com.android.mms",
    desc: "短信彩信服务",
    brand: "Xiaomi",
  },
  {
    name: "联系人",
    package: "com.android.contacts",
    desc: "联系人管理",
    brand: "Xiaomi",
  },
  {
    name: "相机",
    package: "com.android.camera",
    desc: "相机应用",
    brand: "Xiaomi",
  },
  {
    name: "UGD服务",
    package: "com.xiaomi.ugd",
    desc: "用户数据服务",
    brand: "Xiaomi",
  },
  {
    name: "触摸服务",
    package: "com.xiaomi.touchservice",
    desc: "触摸屏服务",
    brand: "Xiaomi",
  },
  {
    name: "WiFi对话框",
    package: "com.android.wifi.dialog",
    desc: "WiFi 弹窗",
    brand: "Xiaomi",
  },
  {
    name: "VPN对话框",
    package: "com.android.vpndialogs",
    desc: "VPN 弹窗",
    brand: "Xiaomi",
  },
  {
    name: "调制解调器测试",
    package: "com.xiaomi.mtb",
    desc: "网络模块测试",
    brand: "Xiaomi",
  },
  {
    name: "MIUI编辑器",
    package: "com.miuix.editor",
    desc: "文本编辑器",
    brand: "Xiaomi",
  },
  {
    name: "自动化UI扩展",
    package: "com.miui.autoui.ext",
    desc: "UI 自动化",
    brand: "Xiaomi",
  },
  {
    name: "小米洞察服务",
    package: "com.miui.misightservice",
    desc: "数据分析服务",
    brand: "Xiaomi",
  },
  {
    name: "小米设置",
    package: "com.xiaomi.misettings",
    desc: "小米设置界面",
    brand: "Xiaomi",
  },
  {
    name: "超级电话",
    package: "com.xiaomi.phone",
    desc: "增强电话服务",
    brand: "Xiaomi",
  },
  {
    name: "弹幕服务",
    package: "com.xiaomi.barrage",
    desc: "弹幕显示服务",
    brand: "Xiaomi",
  },
];
