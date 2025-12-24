# Sinodroid Pure

<div align="center">

![Version](https://img.shields.io/github/v/release/Leskur/sinodroid-pure?style=flat-square&logo=github)
![Build Status](https://img.shields.io/github/actions/workflow/status/Leskur/sinodroid-pure/release.yml?style=flat-square&logo=github-actions)
![Platform](https://img.shields.io/badge/platform-win%20|%20linux%20|%20mac-gray?style=flat-square)
![License](https://img.shields.io/github/license/Leskur/sinodroid-pure?style=flat-square&color=blue)

</div>

一个现代化的 Android 设备管理工具，专为中国安卓设备优化，支持 WiFi/USB 调试、设备信息查看、批量去广告等功能。

## ✨ 特性

### 🔧 设备管理

- **自动设备检测**：实时监控 USB/WiFi 设备插拔
- **WiFi 调试**：支持通过 IP 地址连接 WiFi 设备，自动保存连接历史
- **设备断开**：一键断开设备连接
- **详细信息展示**：全面的设备硬件和系统信息

### 📱 设备信息

- 基础信息：型号、制造商、Android 版本、SDK 版本
- 状态信息：电池、存储、内存、CPU、屏幕分辨率
- 网络信息：WiFi 状态、网络名称、IP 地址
- 系统信息：安全补丁、内核版本、构建版本、主板型号

### 🎯 批量去广告

- 针对中国品牌预置的广告包一键清理
- 支持小米、华为、OPPO、VIVO 等主流品牌
- 实时操作日志反馈

### 🎨 界面设计

- **现代化 UI**：基于 shadcn/ui 组件库
- **深色模式**：自动跟随系统主题
- **响应式布局**：适配不同窗口大小
- **流畅体验**：Toast 提示、加载状态、错误处理

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Android SDK Platform Tools (ADB)
- Tauri 环境（Windows/Linux/macOS）

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run tauri dev
```

### 构建应用

```bash
npm run tauri build
```

## 📁 项目结构

```
sinodroid-pure/
├── src/
│   ├── App.tsx                    # 主应用组件
│   ├── components/
│   │   ├── common/                # 通用组件
│   │   │   ├── LoadingScreen.tsx  # 加载界面
│   │   │   └── ErrorScreen.tsx    # 错误界面
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx        # 侧边栏
│   │   │   └── StatusBar.tsx      # 状态栏
│   │   ├── device/
│   │   │   ├── DeviceListCard.tsx # 设备列表
│   │   │   ├── DeviceInfoCard.tsx # 设备信息
│   │   │   └── WiFiConnectCard.tsx# WiFi 连接
│   │   ├── debloat/
│   │   │   └── DebloatCard.tsx    # 去广告
│   │   └── logs/
│   │       └── LogPanel.tsx       # 日志面板
│   ├── lib/
│   │   └── adb.ts                 # ADB 前端接口
│   └── index.css                  # 全局样式
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs                 # Tauri 主模块
│   │   └── adb/
│   │       ├── commands.rs        # ADB 命令实现
│   │       └── installer.rs       # ADB 安装器
│   └── tauri.conf.json            # Tauri 配置
├── components.json                # shadcn/ui 配置
├── tailwind.config.js             # Tailwind 配置
└── tsconfig.json                  # TypeScript 配置
```

## 🔧 技术栈

### 前端

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS v4** - 样式系统
- **shadcn/ui** - 组件库
- **Lucide React** - 图标库
- **Sonner** - Toast 通知
- **next-themes** - 主题管理

### 后端

- **Tauri v2** - 桌面应用框架
- **Rust** - 系统级操作
- **ADB** - Android 调试桥接

## 📖 使用指南

### 连接设备

1. **USB 连接**：确保设备开启 USB 调试，自动检测
2. **WiFi 连接**：
   - 在 WiFi 连接卡片输入 IP 地址
   - 端口默认 5555（可选）
   - 点击连接，成功后自动刷新设备列表
   - 最近 5 个连接记录自动保存

### 查看设备信息

- 选择设备后自动显示详细信息
- 点击刷新按钮重新获取信息
- WiFi 状态会显示网络名称和 IP 地址

### 批量去广告

1. 选择目标设备
2. 切换到"批量去广告"菜单
3. 点击执行，系统会：
   - 检查每个预置应用是否安装
   - 卸载已安装的广告包
   - 显示实时操作日志

### 自动检测

- 在设备列表开启"自动检测"
- 系统每 2 秒检查一次设备变化
- 自动提示新设备连接/断开

## 🎨 主题系统

应用自动跟随系统主题：

- **浅色模式**：明亮清爽
- **深色模式**：护眼舒适

也可以通过修改 `src/index.css` 自定义主题色。

## 🔍 故障排除

### ADB 工具初始化失败

- 确保已安装 Android SDK Platform Tools
- 检查 PATH 环境变量是否包含 ADB

### WiFi 连接失败

- 确保设备已开启 WiFi 调试
- 检查设备和电脑在同一网络
- 确认端口 5555 未被占用

### 设备信息获取失败

- 部分信息需要 root 权限
- 某些设备厂商可能限制部分接口

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

## 🙏 致谢

- [shadcn/ui](https://ui.shadcn.com/) - 优秀的组件库
- [Tauri](https://tauri.app/) - 桌面应用框架
- [Lucide](https://lucide.dev/) - 精美的图标

---

**Sinodroid Pure** - 让 Android 设备管理更简单高效
