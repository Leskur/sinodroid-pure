import { type BloatwarePackage } from "./types";

/**
 * 小米/Redmi 预装应用列表
 * 参考来源：https://miuiver.com/wp-content/uploads/miui-pre-installed-software.html
 * 以下应用经过验证可以安全禁用，不会影响系统正常使用
 */
export const XIAOMI_PACKAGES: BloatwarePackage[] = [
  // ==================== 广告与数据追踪 ====================
  {
    name: "智能服务",
    package: "com.miui.systemAdSolution",
    desc: "系统广告核心服务",
    brand: "Xiaomi",
  },
  {
    name: "Analytics",
    package: "com.miui.analytics",
    desc: "MIUI数据采集分析",
    brand: "Xiaomi",
  },
  {
    name: "MiuiDaemon",
    package: "com.miui.daemon",
    desc: "后台数据采集服务",
    brand: "Xiaomi",
  },
  {
    name: "Joyose",
    package: "com.xiaomi.joyose",
    desc: "温控限制/用户行为追踪",
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
    desc: "Bug上报工具",
    brand: "Xiaomi",
  },
  {
    name: "三方应用异常分析",
    package: "com.miui.thirdappassistant",
    desc: "第三方应用分析服务",
    brand: "Xiaomi",
  },

  // ==================== 小米服务/广告应用 ====================
  {
    name: "小米商城",
    package: "com.xiaomi.shop",
    desc: "小米购物商城",
    brand: "Xiaomi",
  },
  {
    name: "小米商城系统组件",
    package: "com.xiaomi.ab",
    desc: "商城后台组件",
    brand: "Xiaomi",
  },
  {
    name: "小米有品",
    package: "com.xiaomi.youpin",
    desc: "小米精品电商",
    brand: "Xiaomi",
  },
  {
    name: "小米社区",
    package: "com.xiaomi.vipaccount",
    desc: "小米用户社区",
    brand: "Xiaomi",
  },
  {
    name: "小米直播助手",
    package: "com.mi.liveassistant",
    desc: "直播辅助工具",
    brand: "Xiaomi",
  },
  {
    name: "小米画报",
    package: "com.mfashiongallery.emag",
    desc: "锁屏画报/壁纸广告",
    brand: "Xiaomi",
  },
  {
    name: "内容中心",
    package: "com.miui.newhome",
    desc: "资讯内容聚合（广告较多）",
    brand: "Xiaomi",
  },
  {
    name: "天星金融",
    package: "com.xiaomi.jr",
    desc: "小米金融服务（广告较多）",
    brand: "Xiaomi",
  },
  {
    name: "生活黄页",
    package: "com.miui.yellowpage",
    desc: "电话黄页服务",
    brand: "Xiaomi",
  },
  {
    name: "智能助理",
    package: "com.miui.personalassistant",
    desc: "负一屏智能推荐",
    brand: "Xiaomi",
  },
  {
    name: "智能出行",
    package: "com.miui.smarttravel",
    desc: "出行服务推荐",
    brand: "Xiaomi",
  },
  {
    name: "快应用服务框架",
    package: "com.miui.hybrid",
    desc: "快应用运行框架（广告入口）",
    brand: "Xiaomi",
  },
  {
    name: "服务与反馈",
    package: "com.miui.miservice",
    desc: "用户服务反馈",
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

  // ==================== 输入法（可替换） ====================
  {
    name: "搜狗输入法小米版",
    package: "com.sohu.inputmethod.sogou.xiaomi",
    desc: "预装搜狗输入法",
    brand: "Xiaomi",
  },
  {
    name: "百度输入法小米版",
    package: "com.baidu.input_mi",
    desc: "预装百度输入法",
    brand: "Xiaomi",
  },
  {
    name: "讯飞输入法小米版",
    package: "com.iflytek.inputmethod.miui",
    desc: "预装讯飞输入法",
    brand: "Xiaomi",
  },

  // ==================== 第三方预装应用 ====================
  {
    name: "今日头条",
    package: "com.ss.android.article.news",
    desc: "第三方新闻应用",
    brand: "Xiaomi",
  },
  {
    name: "抖音短视频",
    package: "com.ss.android.ugc.aweme",
    desc: "第三方短视频应用",
    brand: "Xiaomi",
  },
  {
    name: "微博",
    package: "com.sina.weibo",
    desc: "第三方社交应用",
    brand: "Xiaomi",
  },
  {
    name: "手机淘宝",
    package: "com.taobao.taobao",
    desc: "第三方购物应用",
    brand: "Xiaomi",
  },
  {
    name: "淘特",
    package: "com.taobao.litetao",
    desc: "第三方购物应用",
    brand: "Xiaomi",
  },
  {
    name: "拼多多",
    package: "com.xunmeng.pinduoduo",
    desc: "第三方购物应用",
    brand: "Xiaomi",
  },
  {
    name: "支付宝",
    package: "com.eg.android.AlipayGphone",
    desc: "第三方支付应用",
    brand: "Xiaomi",
  },
  {
    name: "百度",
    package: "com.baidu.searchbox",
    desc: "第三方搜索应用",
    brand: "Xiaomi",
  },
  {
    name: "百度地图",
    package: "com.baidu.BaiduMap",
    desc: "第三方地图应用",
    brand: "Xiaomi",
  },
  {
    name: "爱奇艺",
    package: "com.qiyi.video",
    desc: "第三方视频应用",
    brand: "Xiaomi",
  },
  {
    name: "腾讯视频",
    package: "com.tencent.qqlive",
    desc: "第三方视频应用",
    brand: "Xiaomi",
  },
  {
    name: "番茄免费小说",
    package: "com.dragon.read",
    desc: "第三方阅读应用",
    brand: "Xiaomi",
  },
  {
    name: "UC浏览器",
    package: "com.UCMobile",
    desc: "第三方浏览器",
    brand: "Xiaomi",
  },

  // ==================== 可替代的系统应用 ====================
  {
    name: "浏览器",
    package: "com.android.browser",
    desc: "MIUI浏览器（可用Chrome替代）",
    brand: "Xiaomi",
  },
  {
    name: "音乐",
    package: "com.miui.player",
    desc: "小米音乐（广告较多）",
    brand: "Xiaomi",
  },
  {
    name: "小米视频",
    package: "com.miui.video",
    desc: "小米视频（广告较多）",
    brand: "Xiaomi",
  },
  {
    name: "天气",
    package: "com.miui.weather2",
    desc: "系统天气应用",
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
    desc: "系统邮件应用",
    brand: "Xiaomi",
  },
  {
    name: "小米文档查看器",
    package: "cn.wps.moffice_eng.xiaomi.lite",
    desc: "WPS定制文档查看器",
    brand: "Xiaomi",
  },

  // ==================== 语音与AI服务 ====================
  {
    name: "小爱同学",
    package: "com.miui.voiceassist",
    desc: "语音助手（可禁用）",
    brand: "Xiaomi",
  },
  {
    name: "AI虚拟助手",
    package: "com.xiaomi.aiasst.service",
    desc: "AI助手后台服务",
    brand: "Xiaomi",
  },
  {
    name: "语音唤醒",
    package: "com.miui.voicetrigger",
    desc: "小爱语音唤醒服务",
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
    package: "com.xiaomi.payment",
    desc: "米币支付组件",
    brand: "Xiaomi",
  },
  {
    name: "小米钱包",
    package: "com.mipay.wallet",
    desc: "小米钱包应用",
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
    desc: "投屏服务客户端",
    brand: "Xiaomi",
  },
  {
    name: "MIUI+",
    package: "com.xiaomi.mirror",
    desc: "MIUI+ Beta版",
    brand: "Xiaomi",
  },

  // ==================== 工具类（可选禁用） ====================
  {
    name: "万能遥控",
    package: "com.duokan.phone.remotecontroller",
    desc: "红外遥控器",
    brand: "Xiaomi",
  },
  {
    name: "传送门",
    package: "com.miui.contentextension",
    desc: "内容识别传送门",
    brand: "Xiaomi",
  },
  {
    name: "健康",
    package: "com.mi.health",
    desc: "小米健康应用",
    brand: "Xiaomi",
  },
  {
    name: "全球上网",
    package: "com.miui.virtualsim",
    desc: "虚拟SIM卡上网",
    brand: "Xiaomi",
  },
  {
    name: "小米云盘",
    package: "com.miui.newmidrive",
    desc: "小米云盘存储",
    brand: "Xiaomi",
  },
  {
    name: "小米换机",
    package: "com.miui.huanji",
    desc: "数据迁移工具",
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
    desc: "FM收音机",
    brand: "Xiaomi",
  },
  {
    name: "收音机调频服务",
    package: "com.miui.fmservice",
    desc: "FM调频服务",
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
    desc: "桌面使用提示",
    brand: "Xiaomi",
  },
  {
    name: "基本互动屏保",
    package: "com.android.dreams.basic",
    desc: "基本屏保服务",
    brand: "Xiaomi",
  },
  {
    name: "照片屏幕保护程序",
    package: "com.android.dreams.phototable",
    desc: "照片屏保服务",
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
    desc: "系统打印组件",
    brand: "Xiaomi",
  },
  {
    name: "Android无障碍套件",
    package: "com.google.android.marvin.talkback",
    desc: "TalkBack无障碍服务",
    brand: "Xiaomi",
  },
];
