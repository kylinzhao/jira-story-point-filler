# Jira 故事点自动填充插件

## 功能

- ✅ 自动检测 Jira 看板页面
- ✅ 提取任务列表数据
- ✅ 识别"FE Story Points"和"故事点"字段
- ✅ 自动提取认证信息(Cookie/Storage)
- ✅ 批量更新任务
- ✅ 进度提示和结果显示
- ✅ 字段 ID 自定义配置
- ✅ API Token 手动配置
- ✅ 调试工具集
- ⏳ UI 模拟更新(降级方案,开发中)

## 安装

### 开发模式安装

1. 打开 Chrome 扩展管理页面: `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本插件目录

### 使用

1. 打开 Jira 看板页面
2. 点击右下角的闪电图标按钮⚡
3. 查看待更新的任务列表
4. 确认后自动批量更新
5. 查看更新结果

### 配置

点击插件图标,选择"选项",可以配置:
- 故事点字段 ID
- API Token

## 调试

插件加载后,在浏览器控制台可以使用以下调试命令:

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

详见 [TESTING.md](docs/TESTING.md)

## 技术架构

- **Manifest V3**: 最新 Chrome 扩展标准
- **Content Scripts**: 页面交互和数据提取
- **Background Service Worker**: API 调用和批量处理
- **Chrome Storage**: 配置持久化

## 开发

```bash
# 查看扩展详情
chrome://extensions/

# 重新加载扩展
在扩展管理页面点击"重新加载"按钮

# 查看日志
右键扩展图标 → 检查弹出内容
Control/Shift + J 打开 Background Service Worker 控制台
```

## License

MIT
