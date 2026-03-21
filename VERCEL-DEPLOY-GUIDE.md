# Vercel 部署指南

## 📋 部署前检查

- ✅ 本地构建成功
- ✅ 代码已推送到 GitHub
- ✅ 所有功能在本地测试通过

## 🚀 部署步骤

### 方法一：通过 Vercel Dashboard（推荐）

#### 1. 导入 GitHub 仓库

1. 访问 https://vercel.com/
2. 登录你的 Vercel 账户
3. 点击 "Add New..." → "Project"
4. 选择 "Import Git Repository"
5. 找到并选择 `janechen917/ai-summary-app`
6. 点击 "Import"

#### 2. 配置项目设置

**重要：Root Directory 配置**

在 "Configure Project" 页面：

```
Framework Preset: Next.js
Root Directory: my-app    ← 必须设置！点击 "Edit" 按钮修改
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### 3. 配置环境变量

点击 "Environment Variables" 展开，添加以下 5 个变量：

```bash
# Supabase 配置（从 my-app/.env.local 复制）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# GitHub Models 配置
GITHUB_TOKEN=your_github_token_here
GITHUB_MODEL=gpt-4o-mini
```

对于每个变量：
- Name: 填入变量名（如 SUPABASE_URL）
- Value: 填入对应的值
- Environments: 勾选 Production, Preview, Development（所有环境）

#### 4. 部署

1. 检查所有配置是否正确
2. 点击 "Deploy" 按钮
3. 等待部署完成（通常需要 2-3 分钟）

### 方法二：通过 Vercel CLI

如果你更喜欢命令行：

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 在项目根目录部署
cd /workspaces/ai-summary-app
vercel

# 按照提示操作：
# - Set up and deploy? Y
# - Which scope? 选择你的账户
# - Link to existing project? N
# - What's your project's name? ai-summary-app
# - In which directory is your code located? ./my-app    ← 重要！
```

部署后，你需要在 Vercel Dashboard 中手动添加环境变量（同上）。

## 🔍 部署后验证

部署成功后，访问你的 Vercel 域名（如 `https://ai-summary-app.vercel.app`）：

### 1. 测试健康检查
```bash
curl https://your-app.vercel.app/api/health
```
应该返回：`{"status":"ok"}`

### 2. 测试主要功能
- ✅ 访问首页，检查 UI 正常显示
- ✅ 上传文件页面：/upload
- ✅ 历史记录页面：/history
- ✅ 上传一个测试文件并生成摘要
- ✅ 检查历史记录是否显示

### 3. 检查部署日志
如果遇到问题：
1. 在 Vercel Dashboard 中找到你的项目
2. 点击最近的部署
3. 查看 "Building" 和 "Functions" 标签页的日志

## 🛠️ 常见问题

### 问题 1: 构建失败 "Cannot find module..."
**解决方案**：确认 Root Directory 设置为 `my-app`

### 问题 2: 运行时错误 "Missing credentials"
**解决方案**：检查环境变量是否正确配置

### 问题 3: API 调用失败
**解决方案**：
1. 检查 Supabase URL 和 Key 是否正确
2. 检查 GITHUB_TOKEN 是否有效
3. 查看 Vercel 函数日志

### 问题 4: 静态文件 404
**解决方案**：确认 Build Command 和 Output Directory 正确

## 📊 部署成功指标

- ✅ 构建时间 < 3 分钟
- ✅ 所有路由都返回 200
- ✅ /api/health 返回 OK
- ✅ 文件上传和摘要生成正常工作
- ✅ 数据库读写正常

## 🔗 有用的链接

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel 文档: https://vercel.com/docs
- Next.js 部署文档: https://nextjs.org/docs/app/building-your-application/deploying

## 📝 下一步

部署成功后：
1. 将 Vercel 生产环境 URL 更新到 README.md
2. 测试所有功能
3. 如果需要自定义域名，在 Vercel 项目设置中配置
