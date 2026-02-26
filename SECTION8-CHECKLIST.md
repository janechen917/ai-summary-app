# Section 8 完成检查清单

## 第一步：检查 Supabase 数据库表 ✓

### 1.1 访问 Supabase Dashboard

1. 打开浏览器访问：https://supabase.com/dashboard
2. 登录你的账户
3. 选择你的项目

### 1.2 查看 summaries 表

1. 点击左侧菜单的 **"Table Editor"**
2. 查找 `summaries` 表
3. 检查表结构是否包含以下列：
   - ✓ id (UUID)
   - ✓ filename (TEXT)
   - ✓ summary (TEXT)
   - ✓ text_length (INTEGER)
   - ✓ is_truncated (BOOLEAN)
   - ✓ warning (TEXT)
   - ✓ created_at (TIMESTAMP)
   - ✓ updated_at (TIMESTAMP)

### 1.3 如果表不存在

如果没有看到 `summaries` 表：

1. 点击左侧的 **"SQL Editor"**
2. 点击 **"New query"**
3. 复制以下 SQL：

```bash
cat /workspaces/ai-summary-app/supabase-cache-setup.sql
```

4. 粘贴到 SQL Editor
5. 点击 **"Run"** 执行
6. 返回 Table Editor 确认表已创建

---

## 第二步：查看现有数据 ✓

### 2.1 检查是否已有数据

在 Table Editor 的 `summaries` 表中：
- 如果已经有数据行 → 跳到**第三步**
- 如果没有数据 → 继续**2.2 生成测试数据**

### 2.2 生成测试数据（如果需要）

**方法 A：使用现有的摘要页面**

1. 访问：`http://localhost:3000/summary`
2. 选择一个已上传的文件
3. 点击"生成摘要"
4. 等待摘要生成完成
5. 返回 Supabase Table Editor 刷新页面

**方法 B：使用测试脚本（推荐）**

```bash
cd /workspaces/ai-summary-app
./test-section8.sh
```

注意：由于 AI API 速率限制，脚本可能需要等待 20-40 秒。

---

## 第三步：截图数据库 📸

### 3.1 必需截图

在 Supabase Dashboard 中截取以下内容：

**截图 1：表结构**
1. Table Editor → summaries 表
2. 确保能看到所有列名和类型
3. 截图保存为：`image/section8-table-structure.png`

**截图 2：数据内容**
1. 在 summaries 表中，确保能看到至少 1-3 行数据
2. 显示：filename, summary（部分内容）, created_at 等
3. 截图保存为：`image/section8-database-data.png`

### 3.2 可选：SQL 查询截图

1. 点击左侧 **"SQL Editor"**
2. 运行以下查询：

```sql
SELECT 
  filename, 
  LEFT(summary, 80) as summary_preview,
  text_length,
  is_truncated,
  created_at
FROM summaries
ORDER BY created_at DESC
LIMIT 5;
```

3. 截图查询结果
4. 保存为：`image/section8-sql-query.png`

---

## 第四步：验证功能 ✓

### 4.1 测试缓存机制

1. 访问：`http://localhost:3000/summary`
2. 选择一个已经生成过摘要的文件
3. 点击"生成摘要"
4. 观察：
   - ✓ 响应应该非常快（< 1 秒）
   - ✓ 显示 "💾 从缓存加载" 或类似提示
   - ✓ 摘要内容与之前相同

### 4.2 检查 API 返回

打开浏览器开发者工具（F12）：
1. 访问摘要页面
2. 生成一个已有的摘要
3. 查看 Network 标签
4. 找到 `/api/summary` 请求
5. 确认响应中有 `fromCache: true`

---

## 第五步：更新 task2.md 📝

现在我会帮你更新 task2.md 的 Section 8 部分。

### 需要准备的信息：

1. ✓ 数据库表已创建
2. ✓ 表中有测试数据
3. ✓ 已截图（至少2张）
4. ✓ 缓存功能正常工作

---

## 检查清单 ✅

完成后，确认以下项目：

- [ ] Supabase summaries 表已创建
- [ ] 表中至少有 1-3 条测试数据
- [ ] 已保存表结构截图（image/section8-table-structure.png）
- [ ] 已保存数据内容截图（image/section8-database-data.png）
- [ ] 测试了缓存功能（第二次请求很快）
- [ ] task2.md Section 8 已更新（我会帮你完成）

---

## 常见问题

**Q: 表不存在怎么办？**
A: 运行 `supabase-cache-setup.sql` 中的 SQL 语句

**Q: 没有测试数据？**
A: 使用摘要页面生成，或运行 `./test-section8.sh`

**Q: 遇到速率限制？**
A: 等待 1-2 分钟后重试

**Q: 缓存不工作？**
A: 检查环境变量中的 `SUPABASE_SERVICE_ROLE_KEY` 是否正确

---

## 下一步

完成上述步骤后，告诉我：
1. "已完成截图" - 我会帮你更新 task2.md
2. 或者告诉我遇到的具体问题

准备好了吗？开始第一步！
