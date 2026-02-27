# Jira 故事点自动填充插件 - 测试文档

## 手动测试步骤

### 1. 安装插件

1. 打开 Chrome: `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择插件目录

### 2. 基础功能测试

#### 测试 1: 浮动按钮显示
- [ ] 打开 Jira 看板页面
- [ ] 确认右下角显示闪电图标按钮
- [ ] 检查控制台无错误

#### 测试 2: 数据提取
打开控制台,运行:
```javascript
jiraFillerDebug.identifyFields()
```
- [ ] 查看字段识别结果
- [ ] 确认找到"FE Story Points"和"故事点"列

```javascript
jiraFillerDebug.extractTasks()
```
- [ ] 查看提取的任务列表
- [ ] 确认 FE Story Points 和故事点值正确

#### 测试 3: 认证提取
```javascript
jiraFillerDebug.auth()
```
- [ ] 查看认证方式
- [ ] 确认获取到 Token 或 Cookie

#### 测试 4: 任务更新
- [ ] 点击浮动按钮
- [ ] 查看确认对话框
- [ ] 确认任务列表正确
- [ ] 点击"确定"
- [ ] 观察进度提示
- [ ] 查看结果提示
- [ ] 刷新页面验证更新

### 3. 错误场景测试

#### 测试 5: 无任务需要更新
- [ ] 确保所有任务都有故事点
- [ ] 点击按钮
- [ ] 显示"没有找到需要更新的任务"

#### 测试 6: 认证失败
- [ ] 退出 Jira 登录
- [ ] 点击按钮
- [ ] 显示"无法获取认证信息"

#### 测试 7: 字段 ID 配置
- [ ] 打开插件配置页面
- [ ] 修改字段 ID
- [ ] 保存配置
- [ ] 更新任务时使用新字段 ID

### 4. 调试工具验证

在控制台验证所有调试命令可用:
- [ ] `jiraFillerDebug.identifyFields()`
- [ ] `jiraFillerDebug.extractTasks()`
- [ ] `jiraFillerDebug.auth()`
- [ ] `jiraFillerDebug.showCookies()`
- [ ] `jiraFillerDebug.showStorage()`

## 已知问题

### 字段 ID 不匹配
**问题**: API 更新失败,提示字段不存在
**解决**: 在配置页面设置正确的字段 ID

### 认证失败
**问题**: 无法自动提取认证信息
**解决**:
1. 检查是否已登录 Jira
2. 在配置页面手动输入 API Token
3. 如果持续失败,可能需要 UI 模拟方案

## 性能测试

- [ ] 测试 100 个任务的提取速度
- [ ] 测试批量更新 50 个任务的时间
- [ ] 检查内存使用情况
