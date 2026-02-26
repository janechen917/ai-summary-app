# 🚀 Vercel 部署 - 快速修复步骤

## ✅ 已完成
1. ✓ 本地构建测试通过
2. ✓ 创建了 `vercel.json` 配置文件
3. ✓ 推送到 GitHub

---

## 📝 接下来要做的（2 分钟完成）

### 选项 1：等待自动部署（推荐）
Vercel 检测到 `vercel.json` 后会自动重新部署。
- 访问：https://vercel.com/dashboard
- 等待 3-5 分钟
- 查看部署状态

### 选项 2：手动触发重新部署
1. 访问：https://vercel.com/dashboard
2. 选择你的项目
3. 点击「Deployments」
4. 找到最新的部署，点击「...」→「Redeploy」
5. 确认重新部署

---

## ⚙️ 必须配置：环境变量

### 在 Vercel 添加以下环境变量：

1. 进入项目 Settings → Environment Variables
2. 添加以下 4 个变量（Environment: Production）：

```
名称: NEXT_PUBLIC_SUPABASE_URL
值: https://xggwdinlpgghlmxyjfeg.supabase.co

名称: NEXT_PUBLIC_SUPABASE_ANON_KEY
值: [从 my-app/.env.local 复制]

名称: SUPABASE_SERVICE_ROLE_KEY
值: [从 my-app/.env.local 复制]

名称: ZHIPU_API_KEY
值: [从 my-app/.env.local 复制]
```

3. 保存后，重新部署（Deployments → Redeploy）

---

## 🔍 如何获取本地环境变量的值

```bash
# 在终端运行：
cat /workspaces/ai-summary-app/my-app/.env.local
```

复制每个值（不包括引号），粘贴到 Vercel 环境变量中。

---

## ✅ 验证部署成功

部署完成后（约 3-5 分钟），访问：

1. **首页**：`https://your-app.vercel.app`
2. **健康检查**：`https://your-app.vercel.app/api/health`
   - 应返回：`{"ok":true,"message":"Next.js backend is running"}`
3. **上传页面**：`https://your-app.vercel.app/upload`
4. **摘要页面**：`https://your-app.vercel.app/summary`

---

## 🆘 如果还是失败

### 删除并重新创建项目：

1. **删除现有项目**
   - Vercel Dashboard → Settings → Advanced → Delete Project

2. **重新导入**
   - Add New → Project
   - 导入 `janechen917/ai-summary-app`
   - **不需要**手动设置 Root Directory（vercel.json 会自动处理）
   - 添加环境变量
   - Deploy

---

## 📊 诊断工具

### 查看完整构建日志：
1. Vercel Dashboard → 选择项目
2. 点击最新的部署
3. 展开「Building」部分
4. 查看完整错误信息

### 常见错误：
- `Module not found` → 检查 vercel.json 的 installCommand
- `Command failed` → 查看构建日志找到具体错误
- `502 Bad Gateway` → 检查环境变量是否正确

---

## 📚 详细文档

- 完整修复指南：[VERCEL-FIX.md](./VERCEL-FIX.md)
- 部署指南：[VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)

---

## 💡 关键点

✅ **已自动配置**：
- Root Directory: `my-app` (通过 vercel.json)
- Build Command: `cd my-app && npm install && npm run build`
- Output Directory: `my-app/.next`

❗ **需要手动配置**：
- 4 个环境变量（Supabase + ZHIPU_API_KEY）

配置完环境变量后，你的应用就能正常运行了！🎉
