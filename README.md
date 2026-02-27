# Jira 故事点自动填充插件

## 功能

自动将"FE Story Points"字段的值填充到"故事点"字段中。

## 安装

1. 打开 Chrome 扩展管理页面: `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本插件目录

## 使用

1. 打开 Jira 看板页面
2. 点击右下角的闪电图标按钮⚡
3. 查看待更新的任务列表
4. 确认后批量更新

## 开发

- Manifest V3
- 原生 JavaScript(无框架)
- Content Scripts + Background Service Worker
