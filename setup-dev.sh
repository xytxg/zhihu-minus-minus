#!/bin/bash

# iOS 27 优化开发环境快速启动脚本

set -e

echo "🚀 初始化开发环境..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📦 安装依赖...${NC}"
npm install

echo -e "${YELLOW}🔨 生成原生项目...${NC}"
npm run prebuild

echo -e "${YELLOW}🏃 选择运行平台:${NC}"
echo "1) iOS"
echo "2) Android"
echo "3) Web"
read -p "请选择 (1-3): " choice

case $choice in
  1)
    echo -e "${YELLOW}🍎 启动 iOS 模拟器...${NC}"
    npm run ios
    ;;
  2)
    echo -e "${YELLOW}🤖 启动 Android 模拟器...${NC}"
    npm run android
    ;;
  3)
    echo -e "${YELLOW}🌐 启动 Web 版本...${NC}"
    npm run web
    ;;
  *)
    echo "无效选择"
    exit 1
    ;;
esac

echo -e "${GREEN}✅ 环境初始化完成！${NC}"
