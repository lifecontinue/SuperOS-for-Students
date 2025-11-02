# 代码拆分说明

## 已拆分的模块

### 1. `js/state.js` - 全局状态管理
- 包含 `state` 对象的所有初始化
- 包含 persona 数据结构的初始化
- 包含 majors 的扩展数据

### 2. `js/utils.js` - 工具函数
- `markUpdated()` - 标记更新时间
- `getSectionStatus()` - 获取部分状态
- `titleMap()` - 标题映射
- `sectionSummary()` - 部分摘要
- `escapeHtml()` - HTML 转义
- `rand()` - 随机数生成
- `titleCase()` - 标题大小写转换
- `getSection()` - 获取部分
- `setSectionParam()` - 设置部分参数

### 3. `js/sections.js` - 部分模板和加载
- `views` 对象和 `updateViews()` 函数
- `sectionTemplates` - HTML 模板
- `loadSection()` - 加载部分
- `waitForElement()` - 等待元素
- `loadAllSections()` - 加载所有部分

### 4. `js/router.js` - 路由逻辑
- `setRoute()` - 设置路由
- `executeRouteActions()` - 执行路由操作

### 5. `js/auth.js` - 认证模块
- `initAuth()` - 初始化认证
- Google 登录按钮处理
- 邮箱验证码登录
- 邮箱密码登录

### 6. Onboarding - 引导流程模块 (已合并到 app.js)
- `steps` 数组 - 引导步骤
- `goStep()` - 执行步骤
- 引导流程的事件处理
- 语音输入功能

## 需要进一步拆分的模块（在 app.js 中）

以下功能仍在 `app.js` 中，建议后续拆分：

### 7. `js/profile.js` - 个人资料模块
- `renderProfileAndGap()` - 渲染个人资料和 GAP
- `renderProfileSections()` - 渲染个人资料部分
- `tokenHTML()` - Token HTML
- `bindTokenEditorEvents()` - 绑定编辑器事件
- `observeSectionAutoExpand()` - 观察自动展开
- `renderGuideMeta()` - 渲染指南元数据

### 8. `js/gap.js` - GAP 分析模块
- `generateGap()` - 生成 GAP 数据
- `drawRadar()` - 绘制雷达图

### 9. `js/persona.js` - Persona 模块
- `renderPersona()` - 渲染 Persona

### 10. `js/advisor.js` - 专业顾问模块
- `renderMajors()` - 渲染专业列表
- `updateSelectedLabels()` - 更新选中标签
- `performComparison()` - 执行比较
- `compareExtras()` - 比较额外信息

### 11. `js/roadmap.js` - 路线图模块
- `renderGoals()` - 渲染目标
- `renderTimeline()` - 渲染时间线
- `regenRoadmap()` - 重新生成路线图
- `renderRoadmapStages()` - 渲染路线图阶段
- 成就系统相关函数
- 风险计算相关函数
- 植物成长系统相关函数
- 冒险地图相关函数

### 12. `js/tutor.js` - 导师代理模块
- `speak()` - 语音合成
- `updateSubtitle()` - 更新字幕
- `highlightWord()` - 高亮单词
- `toggleTranscript()` - 切换转录
- `showActionSheet()` / `hideActionSheet()` - 显示/隐藏操作表
- `revealPostAuthUI()` - 显示认证后 UI
- `updateInputMode()` - 更新输入模式
- `bindToggleTutor()` - 绑定切换按钮

### 13. `js/voice.js` - 语音识别模块
- `tryStartSpeechRecognition()` - 尝试启动语音识别
- `stopSpeechRecognition()` - 停止语音识别
- `handleUserMessage()` - 处理用户消息
- `handleProfileVoiceText()` - 处理个人资料语音文本
- `renderSuggestions()` - 渲染建议
- `showVoiceSidebar()` / `hideVoiceSidebar()` - 显示/隐藏语音侧边栏
- `bindSuggestionEvents()` - 绑定建议事件
- `applySuggestion()` - 应用建议
- `startProfileListening()` / `stopProfileListening()` - 启动/停止个人资料监听

### 14. `js/editor.js` - 编辑器模块
- `openEditor()` - 打开编辑器
- `renderEditor()` - 渲染编辑器
- `renderActivitiesEditor()` - 渲染活动编辑器
- `openActivityEdit()` - 打开活动编辑

## 文件加载顺序

在 `index.html` 中，脚本应按以下顺序加载：

1. `js/state.js` - 状态管理（最先加载）
2. `js/utils.js` - 工具函数
3. `js/sections.js` - 部分模板
4. `js/router.js` - 路由逻辑
5. `js/auth.js` - 认证模块
6. `app.js` - 主应用逻辑（包含 onboarding 和其他功能）

## 注意事项

- 所有模块共享全局 `state` 对象
- 所有模块共享全局 `views` 对象（在 sections.js 中定义）
- 函数依赖关系通过全局作用域处理
- 确保模块加载顺序正确，避免依赖错误

