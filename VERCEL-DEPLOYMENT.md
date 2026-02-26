# Vercel 部署指南

本指南将帮助你将AI文档摘要应用部署到Vercel。

## 📋 部署前准备

### 1. 确认代码已推送到GitHub
```bash
git status
# 确保显示 "nothing to commit, working tree clean"
```

### 2. 准备环境变量
从本地 `my-app/.env.local` 复制以下信息：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ZHIPU_API_KEY` (使用新的付费API Key)

---

## 🚀 方法1：通过Vercel控制台部署（推荐）

### 步骤1：访问Vercel控制台
1. 打开：https://vercel.com/dashboard
2. 登录你的Vercel账户

### 步骤2：导入GitHub仓库
1. 点击「Add New...」→「Project」
2. 选择「Import Git Repository」
3. 找到并选择 `janechen917/ai-summary-app`
4. 点击「Import」

### 步骤3：配置项目
1. **Framework Preset**: Next.js (自动检测)
2. **Root Directory**: `my-app` ⚠️ 重要！
3. **Build Command**: `npm run build` (默认)
4. **Output Directory**: `.next` (默认)

### 步骤4：设置环境变量
在「Environment Variables」部分添加：

```env
NEXT_PUBLIC_SUPABASE_URL = https://xggwdinlpgghlmxyjfeg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
ZHIPU_API_KEY = your_new_paid_api_key
```

⚠️ **重要提示**：
- 使用新创建的付费API Key（不要用旧的）
- 确保所有值没有引号
- 检查没有多余空格

### 步骤5：部署
1. 点击「Deploy」
2. 等待3-5分钟构建完成
3. 部署成功后会显示预览URL

---

## 🖥️ 方法2：通过CLI部署（快速）

### 步骤1：登录Vercel
```bash
cd /workspaces/ai-summary-app
vercel login
```

### 步骤2：部署到生产环境
```bash
cd my-app
vercel --prod
```

### 步骤3：设置环境变量（首次部署后）
```bash
# 方法A: 通过CLI设置（推荐）
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 输入值并选择环境：Production, Preview, Development

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ZHIPU_API_KEY

# 方法B: 通过控制台设置
# 访问 https://vercel.com/dashboard
# 选择项目 → Settings → Environment Variables
```

### 步骤4：重新部署（应用环境变量）
```bash
vercel --prod
```

---

## ✅ 部署后验证

### 1. 访问部署的应用
Vercel会提供一个URL，例如：
```
https://ai-summary-app-xxx.vercel.app
```

### 2. 测试功能清单

#### ✓ 首页测试
- [ ] 访问首页显示正常
- [ ] UI样式加载正确

#### ✓ 上传功能测试
- [ ] 进入上传页面 `/upload`
- [ ] 上传一个测试文件
- [ ] 确认文件成功上传到Supabase

#### ✓ 摘要功能测试
- [ ] 进入摘要页面 `/summary`
- [ ] 选择已上传的文件
- [ ] 点击「生成摘要」
- [ ] 确认AI摘要成功生成
- [ ] 再次点击同一文件，确认从缓存加载（显示💾标签）

#### ✓ API健康检查
访问：`https://your-app.vercel.app/api/health`
应该返回：`{"status":"ok"}`

---

## 🔍 常见问题排查

### ❌ 构建失败

**错误：Module not found**
```bash
# 解决方案：确保package.json包含所有依赖
cd my-app
npm install
git add package.json package-lock.json
git commit -m "update dependencies"
git push
```

**错误：Root Directory错误**
- 在Vercel项目设置中，确保「Root Directory」设置为 `my-app`

### ❌ 运行时错误

**错误：Supabase连接失败**
- 检查环境变量是否正确设置
- 确认Supabase URL和Keys没有多余空格
- 在Vercel Logs中查看详细错误

**错误：AI API调用失败（401）**
- 确认使用的是新的付费API Key
- 在智谱AI控制台验证Key是否激活
- 检查Key是否正确复制（没有空格或换行）

**错误：速率限制（429）**
- 检查ZHIPU_API_KEY是否为付费账户的Key
- 等待1-2分钟后重试

### ❌ 缓存功能不工作

**检查Supabase数据库**
1. 访问：https://supabase.com/dashboard
2. 进入「SQL Editor」
3. 确认 `summaries` 表已创建

```sql
SELECT * FROM summaries LIMIT 5;
```

如果表不存在，运行：
```sql
-- 复制 supabase-cache-setup.sql 的内容并执行
```

---

## 🔒 安全检查清单

部署前确认：
- [ ] `.env.local` 没有被提交到Git
- [ ] GitHub仓库中没有API密钥
- [ ] Vercel环境变量使用新的付费API Key
- [ ] Supabase Service Role Key正确设置

---

## 🔄 更新部署

当你修改代码后：

### 自动部署（推荐）
```bash
git add .
git commit -m "your changes"
git push origin main
# Vercel会自动检测并部署
```

### 手动部署
```bash
cd my-app
vercel --prod
```

---

## 📊 监控和日志

### 查看实时日志
1. 访问：https://vercel.com/dashboard
2. 选择项目
3. 点击「Deployments」→ 选择最新部署
4. 查看「Runtime Logs」

### 查看构建日志
- 在「Deployments」中查看「Build Logs」
- 检查是否有警告或错误

---

## 🎯 优化建议

### 1. 自定义域名
在Vercel项目设置中添加自定义域名：
- Settings → Domains
- 添加你的域名
- 配置DNS记录

### 2. 性能优化
- 启用Vercel Analytics
- 配置ISR（增量静态再生成）
- 开启Image Optimization

### 3. 成本监控
- 在智谱AI控制台查看API调用统计
- 设置消费预警阈值
- 定期清理旧的Supabase文件

---

## 📞 获取帮助

### Vercel支持
- 文档：https://vercel.com/docs
- 社区：https://github.com/vercel/vercel/discussions

### 项目问题
- GitHub Issues：https://github.com/janechen917/ai-summary-app/issues

---

## ✅ 部署完成！

部署成功后：
1. 保存你的生产URL
2. 测试所有功能
3. 分享给用户使用

示例URL：`https://ai-summary-app.vercel.app`

---

*最后更新：2026-02-25*
