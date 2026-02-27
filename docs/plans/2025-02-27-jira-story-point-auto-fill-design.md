# Jira 故事点自动填充插件 - 设计文档

## 项目概述

开发一个 Chrome 浏览器插件,用于在 Jira 看板中自动将"FE Story Points"字段的值填充到"故事点"字段中。

**目标用户**:前端开发团队
**使用场景**:在"无前端工作量需求"看板中,批量填充缺失的故事点
**工作方式**:半自动 - 检测待更新任务,用户确认后批量更新

## 功能需求

### 核心功能
1. 自动检测 Jira 看板页面
2. 识别"FE Story Points"有值但"故事点"字段为空的任务
3. 显示待更新任务列表
4. 用户确认后批量更新任务
5. 显示更新结果

### 触发方式
- 页面右下角的浮动按钮

### 更新策略(MVP 优先)
- **首选方案**:通过 Jira REST API 更新(快速可靠)
- **降级方案**:模拟页面 UI 操作(如果 API 不可用)

## 架构设计

### 技术架构
采用 **Chrome Manifest V3** 扩展标准,包含三个核心组件:

#### 1. Content Script (内容脚本)
- 页面交互和数据提取
- DOM 操作(浮动按钮、弹窗)
- 从页面提取认证信息
- 与 Background Script 通信

#### 2. Background Script (后台脚本)
- 处理 API 请求
- 管理插件状态
- 错误处理和重试逻辑

#### 3. Options Page (设置页面,可选)
- API Token 手动配置
- 自定义字段 ID 配置
- 操作日志查看

### 文件结构
```
jira-story-point-filler/
├── manifest.json              # 扩展清单文件
├── background.js              # 后台脚本
├── content/
│   ├── content.js            # 内容脚本主文件
│   ├── ui.js                 # UI 组件和交互
│   ├── data-extractor.js    # 数据提取模块
│   ├── auth-extractor.js    # 认证信息提取
│   └── styles.css           # 样式文件
├── popup/
│   ├── popup.html           # 弹窗 HTML
│   └── popup.js             # 弹窗逻辑
└── icons/                    # 插件图标
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 数据流程

### 主流程(API 方式)
```
1. 用户打开 Jira 看板
2. Content Script 检测页面
3. 注入浮动按钮
4. 用户点击按钮
5. 提取任务数据 + 认证信息
6. 显示确认弹窗
7. 用户确认 → API 更新
8. 显示结果
```

### 降级流程(UI 模拟)
```
1-4. (同上)
5. 提取任务数据
6. 认证失败 → 显示 UI 模拟提示
7. 用户确认 → 模拟点击操作
8. 逐个更新任务
9. 显示结果
```

### 数据结构
```javascript
// 任务数据
{
  issueId: "PROJ-123",
  title: "任务标题",
  feStoryPoints: "2.0",
  storyPoints: null,
  status: "进行中"
}

// 更新请求
{
  tasks: [...],
  authMethod: "api" | "ui"
}
```

## 核心模块设计

### 1. 页面检测模块
- URL 匹配: `*://cjira.guazi-corp.com/secure/Dashboard.jspa*`
- 检测"无前端工作量需求"看板
- 页面加载完成后注入 UI

### 2. 数据提取模块
从页面表格提取:
- 任务 ID
- 任务标题
- FE Story Points (第 4 列)
- 故事点字段值
- 任务状态

过滤逻辑:
```javascript
tasks.filter(task =>
  task.feStoryPoints && task.feStoryPoints !== '' &&
  (!task.storyPoints || task.storyPoints === '')
)
```

### 3. 认证信息提取模块
尝试以下方式(按优先级):
1. 从 Cookie 中提取 Session Token
2. 从 LocalStorage 获取认证信息
3. 从 SessionStorage 获取认证信息
4. 提示用户手动输入 API Token

### 4. API 更新模块
```
端点: /rest/api/2/issue/{issueId}
方法: PUT
请求体: {"fields": {"customfield_XXXXX": "值"}}
```

支持:
- 批量更新
- 错误重试
- 并发控制

### 5. UI 模块(降级方案)
- 逐个打开任务编辑弹窗
- 填写故事点字段
- 保存并等待完成
- 继续下一个任务

## 用户界面设计

### 浮动按钮
- 位置:右下角(20px 边距)
- 样式:蓝色圆形,直径 56px
- 图标:⚡ 闪电图标
- 提示:"检查并填充故事点"

### 确认弹窗
- 尺寸:800px × 600px
- 内容:
  - 统计信息
  - 任务列表(表格)
  - 全选/取消功能
  - 开始更新/取消按钮

### 进度提示
- 进度条
- 实时状态:"正在更新 3/5..."
- 成功/失败标识

### 结果弹窗
- 统计:成功/失败数量
- 失败任务列表
- 重试按钮

## 安全性设计

### 权限最小化
- 只请求必要权限:`activeTab`, `storage`
- 不访问无关网站

### 数据保护
- 认证信息本地存储
- 不上传到外部服务器
- 加密存储 API Token

### CSP 策略
- 严格的 Content Security Policy
- 防止 XSS 攻击

## 错误处理

### 认证错误
- Cookie 提取失败 → 提示手动输入 Token
- Token 过期(401) → 提示重新登录
- 权限不足(403) → 提示联系管理员

### 网络错误
- 超时 → 重试 3 次
- 服务不可用(502/503) → 提示稍后重试
- 部分成功 → 显示详细结果

### 数据错误
- 字段 ID 不匹配 → 提供配置界面
- 并发冲突 → 提示是否覆盖
- 格式错误 → 跳过并记录

## MVP 实现计划

### 第一阶段(MVP)
1. 基础框架搭建
2. 页面检测和浮动按钮
3. 数据提取功能
4. 认证信息提取(调试模式)
5. API 更新功能
6. 确认弹窗和结果显示

### 测试重点
- 认证提取是否成功
- API 调用是否可用
- 错误处理是否完善

### 第二阶段(如需要)
- UI 模拟方案(降级)
- 设置页面
- 操作日志
- 优化和完善

## 技术栈

- **Chrome Extension API**: Manifest V3
- **纯 JavaScript**:无需框架
- **CSS3**:原生样式
- **Chrome Storage API**:数据持久化

## 兼容性

- Chrome/Edge 88+
- Manifest V3 支持

## 后续扩展

- 支持其他 Jira 实例
- 支持自定义字段映射
- 定时自动检查
- 导出操作报告
- 团队共享配置

## 依赖和限制

- 需要在公司内网环境使用
- 需要用户已登录 Jira
- API Token 需要相应权限
- 依赖 Jira 页面 DOM 结构(可能随版本变化)

## 风险和缓解

### 风险
1. Jira DOM 结构变化 → 数据提取失败
2. 认证方式变化 → API 不可用
3. 权限限制 → 无法更新任务

### 缓解措施
1. 提供字段 ID 配置界面
2. 实现 UI 模拟降级方案
3. 详细的错误提示和日志

## 版本历史

- **v1.0 (MVP)**: API 方式 + 基础功能
- **v1.1**: UI 模拟降级方案
- **v1.2**: 设置页面和高级配置
