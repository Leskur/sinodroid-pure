# Sinodroid Pure

<div align="center">

![Version](https://img.shields.io/github/v/release/Leskur/sinodroid-pure?style=flat-square&logo=github)
![Build Status](https://img.shields.io/github/actions/workflow/status/Leskur/sinodroid-pure/release.yml?style=flat-square&logo=github-actions)
![Platform](https://img.shields.io/badge/platform-win%20|%20linux%20|%20mac-gray?style=flat-square)
![License](https://img.shields.io/github/license/Leskur/sinodroid-pure?style=flat-square&color=blue)

> **极简 · 纯净 · 自由**

</div>

<br/>

**Sinodroid Pure** 是一款轻量级的 Android 设备管理工具。

专注于核心体验：**无线调试**、**应用精简**、**设备概览**。
旨在为用户提供**简单、高效**的设备管理方案。

---

<!-- 在这里放一张帅气的运行截图，展示 Glacial Ice 主题 -->
<!-- ![Sinodroid Pure Screenshot](./screenshot.png) -->

## ✨ 当前功能 (v0.0.2)

- **🔌 设备连接**：支持 USB 有线及 WiFi 无线调试模式。
- **🧹 应用管理**：提供预置应用精简列表
  - [x] **Xiaomi / HyperOS**
  - [ ] Huawei / HarmonyOS
  - [ ] OPPO / ColorOS
  - [ ] VIVO / OriginOS
- **📊 设备信息**：展示主要硬件信息及实时状态。
- **🎨 现代化界面**：采用 `Glacial Ice` 主题，简洁清爽。

## 🚀 极速上手

### 下载安装

直接前往 [Releases](https://github.com/Leskur/sinodroid-pure/releases) 页面下载对应系统的安装包。

## 🛠️ 开发指南

### 环境要求

- **Node.js**: v18.0.0 或更高版本
- **Rust**: v1.70.0 或更高版本
- **包管理器**: 推荐使用 `pnpm`

### 系统依赖 (Linux 用户)

如果你使用的是 Ubuntu/Debian，需要安装 Tauri 的构建依赖：

```bash
sudo apt-get update
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### 构建步骤

```bash
# 1. 克隆仓库
git clone https://github.com/Leskur/sinodroid-pure.git
cd sinodroid-pure

# 2. 安装项目依赖
pnpm install

# 3. 启动开发服务器 (Hot Reload)
pnpm run tauri dev

# 4. 构建生产版本
pnpm run tauri build
```

## 🛠️ 技术底座

由以下硬核技术驱动：

- **Core**: [Rust](https://www.rust-lang.org/) + [Tauri v2](https://tauri.app/) (极致性能 & 安全)
- **UI**: [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Bridge**: Native ADB Implementation (无第三方依赖)

## 📄 许可

MIT License © 2025 Leskur
