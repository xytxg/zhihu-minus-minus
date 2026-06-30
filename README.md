# 🐱 知乎 -- (Zhihu Minus Minus)

> [!IMPORTANT]
> **🚧 项目声明**：本项目目前仍处于**比较早期且不稳定的开发阶段**，部分功能可能不完整且存在不稳定的 API。

快去看看 <https://github.com/zhihulite/Hydrogen> 和 <https://github.com/zly2006/zhihu-plus-plus>

![zhihu--](./assets/images/favicon.svg)

一款轻量级、纯净、无广告的第三方知乎客户端，基于 **React Native (Expo)** 构建。旨在回归阅读本质，提供极致丝滑的知乎浏览体验。

## ✨ 特性

- **纯净**: 只有你想看的内容，没有广告，没有臃肿的功能。
- **沉浸式阅读**: 适配系统亮色与暗色模式。
- **功能**:
  - **日报**: 知乎日报。
  - **滑动**: 首页子频道、发布中心、个人中心通过一个统一的水平滑动轴无缝切换。
  - **首页**: 热榜、推荐、关注动态（支持实时联动的顶部 Tab）。
  - **搜索**: 全站与个人主页的知乎搜索，支持联想词、综合搜索、用户搜索及关键词高亮。
  - **详情**: 优雅的问题展示、回答/文章详情、评论交互（支持二级回复）。
    - 目前 关注/推荐 tab 点击问题文字会进入问题详情（长列表里直接可以直接查看，展开所有回答），点击回答内容会进入回答详情（左右滑动查看）。
    - 具体内容功能：段落交互、数学公式、知乎站内链接卡片...  
  - **个人**: 我的主页、个人点赞/收藏、浏览历史记录、粉丝/关注列表。
- **Zhihu Deep Linking**: 完整支持 zhihu.com 外部链接唤起，智能归一化路径。
- **一键更新**: 支持从 GitHub Releases 自动检测并下载安装新版本 (v0.0.12 后才可以) 
- **现代化架构**: 全面拥抱 Expo Router、TanStack Query V5、Tailwind CSS (NativeWind) 和 Zustand。

## 📸 界面预览

<div align="center">
  <table style="border-collapse: separate; border-spacing: 15px;">
    <tr>
      <td align="center" valign="top">
        <img src="./screenshot/v0.0.4/photo_2026-03-12_23-31-07.jpg" width="160" style="border-radius: 16px; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        <br /><br />
        <b>搜索</b><br />
      </td>
      <td align="center" valign="top">
        <img src="./screenshot/v0.0.2/photo_5_2026-03-09_01-45-47.jpg" width="160" style="border-radius: 16px; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        <br /><br />
        <b>问题</b><br />
      </td>
      <td align="center" valign="top">
        <img src="./screenshot/v0.0.4/photo_2026-03-12_23-33-16.jpg" width="160" style="border-radius: 16px; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        <br /><br />
        <b>夜间模式</b><br />
      </td>
      <td align="center" valign="top">
        <img src="./screenshot/v0.0.2/photo_3_2026-03-09_01-45-47.jpg" width="160" style="border-radius: 16px; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        <br /><br />
        <b>消息</b><br />
      </td>
      <td align="center" valign="top">
        <img src="./screenshot/v0.0.4/photo_2026-03-12_23-31-25.jpg" width="160" style="border-radius: 16px; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        <br /><br />
        <b>段落交互</b><br />
      </td>
    </tr>
  </table>
</div>

## 📦 下载与安装

### 🤖 Android
你可以直接前往 [GitHub Releases](https://github.com/huamurui/zhihu-minus-minus/releases) 下载最新的 APK 文件进行安装。
> [!NOTE]
> 注意 apk 名称，目前提供的 20mb 左右的 APK 只能在 `arm64` 的安卓设备上运行（只要不是太老的设备都可以）。

或者

1. `git clone` 本仓库。
2. 安装环境（参考下方的 **快速开始**）。
3. 难蚌 expo 搞的只有 Linux/macOS 才能本地打包安卓...

`npm run prebuild`

`eas build --platform android --profile preview --local`

这个还没试过：

`cd android && ./gradlew assembleRelease`

或者修改 app.json 信息，注册 expo 账号使用 expo 服务器打包。

### 🍎 iOS

本应用不会在 App Store 上架。
[GitHub Releases](https://github.com/huamurui/zhihu-minus-minus/releases) 可以在这里找找，有尝试打包的未签名 ipa 但我没什么 ios 越狱经验和设备，可能无法使用。

- rn 打的 ipa 包 ios 最低要求 ios15.1，但具体什么情况不清楚喵...

如果你有 mac，可以试试自己打包：
1. `git clone` 本仓库。
2. 安装环境（参考下方的 **快速开始**）。
3. 使用自己的 Apple ID 在 Xcode 中进行签名并编译到真机。

`cd ios && pod install`

`npx expo run:ios --configuration Release --device`

⬆️ 这个在 ios26 也不好用了，建议 Xcode 里 build。

(有认试过 expo 的线上打包一定要 apple 开发者账号哦...)

## 🚀 快速开始

本项目涉及到一些原生库，推荐使用 **Development Build** 进行开发。

基础环境:
- node, npm
- eas cli
- 安卓
  - Android Studio/或者至少 adb sdk
  - Java JDK 17, maven...
- iOS
  - Xcode
  - cocoapods ...

对于本项目:

1. **准备环境**

```bash
npm install -g expo-cli
```

2. **安装依赖**
```bash
npm install
```

2.1 **生成原生项目目录**

```bash
npm run prebuild
```

3. **运行 Android** (需要 ADB 或模拟器环境)
```bash
npm run android
```

4. **运行 iOS** (需要 Mac 且安装 Xcode, idb)
```bash
npm run ios
```

## 🔐 登录说明

由于知乎 API 的安全性限制（X-ZSE-96 等），目前采用 WebView 自动拦截方案：
- 打开应用 -> 进入“我的” -> 点击登录按钮。
- 在弹出的登录界面完成登录。

## 📝 RoadMap

- [suisuinian.md](./suisuinian.md)

## 🤝 贡献与声明

- **免责声明**: 本项目仅供学习交流使用，不建议用于商业用途。
- **License**: GPL-3.0 license

---
**Author**: [huamurui](https://github.com/huamurui) & [Antigravity Agent] 🐱
**Version**: v0.1.1 | **Last Updated**: 2026-06-30
