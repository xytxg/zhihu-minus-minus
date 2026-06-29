#!/bin/bash

# iOS 27 优化版本构建脚本
# 支持 iOS 和 Android 双平台构建

set -e

echo "🚀 开始构建流程..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 平台选择
PLATFORM=${1:-"all"}

if [ "$PLATFORM" != "ios" ] && [ "$PLATFORM" != "android" ] && [ "$PLATFORM" != "all" ]; then
  echo -e "${RED}❌ 无效的平台选择。用法: ./build.sh [ios|android|all]${NC}"
  exit 1
fi

echo -e "${YELLOW}📦 清理旧构建...${NC}"
npm run prebuild -- --clean

if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
  echo -e "${YELLOW}🍎 开始 iOS 构建...${NC}"
  
  # 清理 iOS 构建目录
  rm -rf ios/Pods
  rm -rf ios/Podfile.lock
  
  # 使用 EAS 构建
  eas build --platform ios --profile preview --local
  
  echo -e "${GREEN}✅ iOS 构建完成！${NC}"
fi

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
  echo -e "${YELLOW}🤖 开始 Android 构建...${NC}"
  
  # 清理 Android 构建目录
  rm -rf android/build
  rm -rf android/app/build
  
  # 使用 EAS 构建
  eas build --platform android --profile preview --local
  
  echo -e "${GREEN}✅ Android 构建完成！${NC}"
fi

echo -e "${GREEN}🎉 所有构建完成！${NC}"
echo -e "${YELLOW}📱 安装包位置: eas/builds/${NC}"
