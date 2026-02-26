# Vercel 部署问题快速修复指南

## 🔴 当前问题
根据日志，构建正在进行中。如果构建失败，通常是以下原因之一。

---

## ✅ 解决方案：正确配置 Root Directory

### ⚠️ 最常见问题：Root Directory 未设置

你的项目结构是：
```
ai-summary-app/          ← GitHub 仓库根目录
  └── my-app/            ← Next.js 项目目录
      ├── package.json
      ├── next.config.ts
      └── app/
```

**必须将 Root Directory 设置为 `my-app`！**

---

## 🛠️ 修复步骤（通过 Vercel 控制台）

### 步骤 1：进入项目设置
1. 访问：https://vercel.com/dashboard
2. 选择你的项目 `ai-summary-app`
3. 点击「Settings」标签

### 步骤 2：修改 Root Directory
1. 在左侧菜单选择「General」
2. 找到「Build & Development Settings」部分
3. 在「Root Directory」下：
   - 点击「Edit」
   - 输入：`my-app`
   - 点击「Save」

### 步骤 3：配置环境变量
1. 在左侧菜单选择「Environment Variables」
2. 添加以下变量（针对 Production）：

```
NEXT_PUBLIC_SUPABASE_URL
值：https://xggwdinlpgghlmxyjfeg.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
值：[从本地 .env.local 复制]

SUPABASE_SERVICE_ROLE_KEY
值：[从本地 .env.local 复制]

ZHIPU_API_KEY
值：[你的智谱 AI API Key]
```

### 步骤 4：重新部署
1. 点击顶部的「Deployments」标签
2. 找到最新的部署
3. 点击右侧的「...」菜单
4. 选择「Redeploy」
5. 确认「Redeploy」

---

## 🖥️ 方法 2：使用 CLI 快速修复（推荐）

### 创建 vercel.json 配置文件

在项目**根目录**（不是 my-app 内）创建 `vercel.json`：

```bash
cd /workspaces/ai-summary-app
cat > vercel.json << 'EOF'
{
  "buildCommand": "cd my-app && npm run build",
  "devCommand": "cd my-app && npm run dev",
  "installCommand": "cd my-app && npm install",
  "framework": "nextjs",
  "outputDirectory": "my-app/.next"
}
EOF
```

或者更简单的方式，直接指定根目录：

```bash
cd /workspaces/ai-summary-app
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "my-app/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "my-app/$1"
    }
  ]
}
EOF
```

### 提交并推送

```bash
git add vercel.json
git commit -m "fix: add Vercel configuration for monorepo structure"
git push origin main
```

Vercel 会自动检测更改并重新部署。

---

## 🔍 检查构建日志

### 在 Vercel 控制台查看详细错误

1. 访问：https://vercel.com/dashboard
2. 选择项目
3. 点击最新的部署
4. 查看「Building」部分的完整日志

### 常见错误及解决方案

#### ❌ 错误 1：`Error: Cannot find module`
**原因**：Root Directory 未设置或依赖未安装

**解决**：
```bash
cd /workspaces/ai-summary-app/my-app
npm install
git add package-lock.json
git commit -m "update package-lock.json"
git push
```

#### ❌ 错误 2：`Build failed with exit code 1`
**原因**：TypeScript 类型错误或构建错误

**解决**：本地测试构建
```bash
cd /workspaces/ai-summary-app/my-app
npm run build
```

如果本地构建成功，问题在于 Vercel 配置。

#### ❌ 错误 3：环境变量未定义
**原因**：Vercel 环境变量未设置

**解决**：参考「步骤 3：配置环境变量」

---

## ✅ 验证部署成功

部署完成后，测试以下端点：

### 1. 健康检查
```bash
curl https://your-app.vercel.app/api/health
# 应返回：{"ok":true,"message":"Next.js backend is running"}
```

### 2. 文件列表
```bash
curl https://your-app.vercel.app/api/list
# 应返回文件列表
```

### 3. 访问首页
在浏览器打开：`https://your-app.vercel.app`

---

## 🚨 如果问题仍然存在

### 完整的重新部署流程

1. **删除现有项目**（在 Vercel 控制台）
   - Settings → Advanced → Delete Project

2. **本地测试**
   ```bash
   cd /workspaces/ai-summary-app/my-app
   npm run build
   npm start
   # 访问 http://localhost:3000 确认工作正常
   ```

3. **推送最新代码**
   ```bash
   git add .
   git commit -m "prepare for Vercel deployment"
   git push origin main
   ```

4. **重新导入项目**
   - 在 Vercel 控制台创建新项目
   - 导入 `janechen917/ai-summary-app`
   - **重要**：设置 Root Directory 为 `my-app`
   - 添加所有环境变量
   - 点击 Deploy

---

## 📋 部署检查清单

使用此清单确保一切配置正确：

- [ ] Root Directory 设置为 `my-app`
- [ ] 所有环境变量已添加到 Vercel
- [ ] 本地构建成功（`npm run build`）
- [ ] `.env.local` 未提交到 Git
- [ ] GitHub 代码是最新的
- [ ] 使用 Next.js 16.x 兼容依赖

---

## 💡 推荐配置总结

### 最简单的方式：

**1. 在项目根目录创建 `vercel.json`：**
```json
{
  "buildCommand": "cd my-app && npm install && npm run build",
  "devCommand": "cd my-app && npm run dev",
  "installCommand": "cd my-app && npm ci --prefer-offline --no-audit",
  "framework": null,
  "outputDirectory": "my-app/.next"
}
```

**2. 提交并推送：**
```bash
git add vercel.json
git commit -m "add Vercel configuration"
git push
```

**3. 在 Vercel 控制台添加环境变量**

**4. 重新部署**

现在你的应用应该能成功部署了！🎉
