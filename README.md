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

## 调试

插件加载后,可以在浏览器控制台使用以下调试命令:

```javascript
// 识别页面字段
jiraFillerDebug.identifyFields()

// 提取任务数据
jiraFillerDebug.extractTasks()

// 查看认证信息
jiraFillerDebug.auth()

// 查看 Cookies
jiraFillerDebug.showCookies()

// 查看 Storage
jiraFillerDebug.showStorage()
```

## 故障排除

### 1. 浮动按钮不显示
- 打开开发者工具控制台,检查是否有错误
- 确认 URL 匹配 `cjira.guazi-corp.com/secure/Dashboard.jspa`
- 刷新页面重试

### 2. 认证失败
- 确认已登录 Jira
- 运行 `jiraFillerDebug.showCookies()` 查看是否有 session cookie
- 运行 `jiraFillerDebug.auth()` 查看认证提取结果

### 3. 任务数据提取不正确
- 运行 `jiraFillerDebug.identifyFields()` 查看页面结构
- 运行 `jiraFillerDebug.extractTasks()` 查看提取的数据
- 检查控制台日志

### 4. API 更新失败
- 检查故事点字段 ID 是否正确(可能需要修改 `customfield_10101`)
- 查看网络请求的响应内容
- 检查是否有足够的权限
