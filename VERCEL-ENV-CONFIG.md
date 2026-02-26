# 🔐 Vercel 环境变量配置清单

## ⚡ 快速复制粘贴（3 分钟完成）

### 步骤 1：访问 Vercel 设置
1. 打开：https://vercel.com/dashboard
2. 选择你的项目 `ai-summary-app`
3. 点击「Settings」→「Environment Variables」

---

### 步骤 2：添加以下 4 个环境变量

> **重要提示**：
> - 选择 Environment: `Production` （至少）
> - 可以同时勾选 Preview 和 Development
> - 复制完整的值，**不要包含引号**
> - 确保没有多余的空格

---

#### 变量 1：Supabase URL

**Name（变量名）：**
```
NEXT_PUBLIC_SUPABASE_URL
```

**Value（值）：**
```
https://xggwdinlpgghlmxyjfeg.supabase.co
```

**Environment:**
- ☑️ Production
- ☑️ Preview
- ☑️ Development

---

#### 变量 2：Supabase Anon Key

**Name：**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Value：**
```
[从本地 my-app/.env.local 文件复制]
```

> 提示：运行 `cat my-app/.env.local` 查看完整值

**Environment:**
- ☑️ Production
- ☑️ Preview
- ☑️ Development

---

#### 变量 3：Supabase Service Role Key

**Name：**
```
SUPABASE_SERVICE_ROLE_KEY
```

**Value：**
```
[从本地 my-app/.env.local 文件复制]
```

> 提示：运行 `cat my-app/.env.local` 查看完整值

**Environment:**
- ☑️ Production
- ☐ Preview (可选)
- ☐ Development (可选)

> ⚠️ **安全提示**：Service Role Key 有管理员权限，只在生产环境需要

---

#### 变量 4：智谱 AI API Key

**Name：**
```
ZHIPU_API_KEY
```

**Value：**
```
[从本地 my-app/.env.local 文件复制]
```

> 提示：运行 `cat my-app/.env.local` 查看完整值

**Environment:**
- ☑️ Production
- ☑️ Preview
- ☑️ Development

---

### 步骤 3：保存并重新部署

1. 点击「Save」保存每个变量
2. 完成所有 4 个变量后，点击顶部「Deployments」
3. 找到最新的部署，点击「...」→「Redeploy」
4. 勾选「Use existing Build Cache」
5. 点击「Redeploy」

---

## 📋 验证清单

添加完成后，确认：

- [ ] 4 个变量全部添加
- [ ] 每个变量的值没有引号
- [ ] 每个变量的值没有多余空格
- [ ] Production 环境已选中
- [ ] 已触发重新部署

---

## ✅ 测试部署结果

部署完成后（约 3-5 分钟），测试以下功能：

### 1. API 健康检查
```bash
curl https://your-app-url.vercel.app/api/health
```
**预期返回：**
```json
{"ok":true,"message":"Next.js backend is running"}
```

### 2. 文件列表 API
```bash
curl https://your-app-url.vercel.app/api/list
```
**预期返回：** 文件列表的 JSON

### 3. 访问前端页面
- 首页：`https://your-app-url.vercel.app`
- 上传页面：`https://your-app-url.vercel.app/upload`
- 摘要页面：`https://your-app-url.vercel.app/summary`

---

## 🔍 故障排除

### 如果 API 返回 500 错误：

**检查 Vercel 日志：**
1. Dashboard → 项目 → Deployments
2. 点击最新部署
3. 查看「Functions」标签
4. 点击失败的函数查看错误

**常见问题：**
- Supabase 连接失败 → 检查 URL 和 Keys 是否正确
- AI API 失败 → 检查 ZHIPU_API_KEY 是否正确
- 变量未定义 → 确保变量名拼写正确（区分大小写）

---

## 📸 配置截图说明

添加环境变量的界面应该看起来像这样：

```
Environment Variables
┌────────────────────────────────────────────────┐
│ Name: NEXT_PUBLIC_SUPABASE_URL                │
│ Value: https://xggwdinlpgghlmxyjfeg.supabase...│
│ Environment:                                   │
│   ☑ Production ☑ Preview ☑ Development       │
│                                    [Add]       │
└────────────────────────────────────────────────┘
```

每添加一个变量后，它会出现在列表中：
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ZHIPU_API_KEY

---

## 🎯 下一步

配置完成并重新部署后：

1. ✅ 测试所有 API 端点
2. ✅ 测试文件上传功能
3. ✅ 测试 AI 摘要生成
4. ✅ 截图保存到 `image/` 文件夹
5. ✅ 更新 task2.md 的部署部分

---

## 💡 提示

- **自动部署**：以后每次 `git push` 都会自动触发部署
- **预览部署**：每个 Pull Request 都会有独立的预览 URL
- **域名**：可以在 Settings → Domains 添加自定义域名

完成这些步骤后，你的应用就成功部署到 Vercel 了！🎉
