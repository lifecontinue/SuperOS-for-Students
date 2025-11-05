# Academic Advisor Module

这是一个完整的学术管理流程系统，帮助学生检查学术档案、获得课程推荐、管理GPA，并最终达成符合目标专业要求的成绩。

## 文件结构

1. **check_academic_profile.html** - 检查学术档案
   - 检查学生当前GPA、已选课程、目标专业和学术目标
   - 显示信息完整度和进度
   - 允许继续到课程推荐

2. **recommend_courses.html** - 课程推荐
   - 基于目标专业和当前GPA推荐个性化课程
   - 显示课程匹配度、描述和标签
   - 支持按类别筛选（必修、选修、先修课程）
   - 学生可以选择计划学习的课程

3. **manage_gpa.html** - GPA管理
   - 显示当前GPA、目标GPA和预测GPA
   - 允许学生为每门课程设置预期成绩
   - 提供多种GPA场景分析（乐观、现实、保守）
   - 跟踪GPA进度和目标差距

4. **achieve_goal.html** - 达成目标成绩
   - 显示目标达成情况总结
   - 展示完整的进度时间线
   - 提供推荐行动计划
   - 显示成就和里程碑

## 使用流程

1. 从 `check_academic_profile.html` 开始
2. 检查学术信息完整性（GPA、课程、目标专业）
3. 查看基于目标专业的个性化课程推荐
4. 选择计划学习的课程
5. 为每门课程设置预期成绩，查看GPA预测
6. 分析不同场景下的GPA结果
7. 查看目标达成情况和进度跟踪
8. 获取行动计划和建议

## 数据存储

系统使用 `localStorage` 存储以下数据：
- `academicProfile` - 学术档案信息（GPA、目标、课程成绩等）
- `selectedCourses` - 选择的推荐课程列表

## 功能特点

- ✅ 响应式设计，支持移动端
- ✅ 深色主题，与major_advisor风格一致
- ✅ 完整的学术管理流程
- ✅ GPA计算和预测功能
- ✅ 多场景分析
- ✅ 进度跟踪和可视化
- ✅ 成就系统
- ✅ 个性化课程推荐

## 使用方法

直接在浏览器中打开 `check_academic_profile.html` 开始使用，或通过本地服务器访问：

```bash
# 在 demo 目录下运行
python -m http.server 8000
# 然后访问 http://localhost:8000/academic/check_academic_profile.html
```

## 页面间导航

- `check_academic_profile.html` → `recommend_courses.html`
- `recommend_courses.html` → `manage_gpa.html`
- `manage_gpa.html` → `achieve_goal.html`
- `achieve_goal.html` → 主仪表板或重新开始流程

## 注意事项

- 这是一个演示系统，使用 localStorage 存储数据
- GPA计算基于标准4.0分制
- 课程推荐数据是示例数据，实际使用时需要接入真实的课程数据库
- 建议与实际学校的学术系统集成以获取准确数据

