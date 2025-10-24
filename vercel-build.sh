#!/bin/bash
# Vue CLI 项目自定义 Vercel 构建脚本

echo "🚀 Running Vue CLI build..."
npm install
npm run build

echo "✅ Build finished, moving output to Vercel folder..."
mkdir -p /vercel/output
cp -r dist/* /vercel/output
