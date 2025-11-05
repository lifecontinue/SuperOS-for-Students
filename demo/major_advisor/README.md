# Major Advisor Demo

这是一个完整的专业选择流程演示系统，帮助学生选择目标专业并完成相关任务。

## 文件结构

1. **check_profile.html** - 检查学生信息
   - 检查学生是否提交了interest、GPA和hobby等信息
   - 显示信息完整度
   - 允许继续下一步

2. **recommend_categories.html** - 推荐大类
   - 基于学生信息推荐专业大类（工程类、理学类、商科类等）
   - 学生可以选择一个或多个大类
   - 支持跳过直接输入目标专业

3. **refine_majors.html** - 细化专业推荐
   - 根据选择的大类推荐具体专业（3-5个）
   - 显示专业匹配度、描述和亮点
   - 支持直接输入目标专业

4. **analyze_target_major.html** - AI专业分析
   - AI分析目标专业
   - 显示匹配度、专业介绍、优势挑战、职业前景
   - 提供AI专业建议

5. **create_tasklist.html** - 创建任务列表
   - 基于选择的专业创建个性化任务列表
   - 包含研究任务、在线课程、夏校实习三类任务
   - 显示任务优先级和描述

6. **execute_tasks.html** - 执行任务
   - 专业研究：完成研究任务，查看研究结果
   - 在线课程：浏览推荐的网课，点击了解详情
   - 夏校实习：查看推荐的夏校和实习项目，申请了解

7. **confirm_major.html** - 确认专业选择
   - 显示专业选择摘要
   - 展示任务完成情况
   - 确认并更新到个人档案

## 使用流程

1. 从 `check_profile.html` 开始
2. 检查个人信息完整性
3. 选择专业大类或跳过
4. 选择具体专业或输入目标专业
5. 查看AI分析结果
6. 创建并查看任务列表
7. 执行各项任务
8. 确认专业选择并更新档案

## 数据存储

系统使用 `localStorage` 存储以下数据：
- `studentProfile` - 学生档案信息
- `selectedCategories` - 选择的大类
- `selectedMajor` - 选择的专业
- `majorAnalysis` - AI分析结果
- `completedTasks` - 已完成的任务
- `majorConfirmed` - 专业确认状态

## 功能特点

- ✅ 响应式设计，支持移动端
- ✅ 深色主题，与项目风格一致
- ✅ 完整的流程引导
- ✅ 任务追踪和完成状态
- ✅ 专业推荐和AI分析
- ✅ 网课和夏校推荐
- ✅ 档案更新功能

## 使用方法

直接在浏览器中打开 `check_profile.html` 开始使用，或通过本地服务器访问：

```bash
# 在 demo 目录下运行
python -m http.server 8000
# 然后访问 http://localhost:8000/major_advisor/check_profile.html
```

## 注意事项

- 这是一个演示系统，使用 localStorage 存储数据
- 网课和夏校的链接是示例链接，实际使用时需要替换为真实链接
- AI分析结果是模拟数据，实际使用时需要接入真实的AI分析服务


