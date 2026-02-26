# 🚀 Vercel 部署正确配置步骤

## ❌ 问题原因
`vercel.json` 中的 `cd my-app` 命令在 Vercel 构建环境中不工作。
正确的方法是在 Vercel 控制台直接设置 Root Directory。

---

## ✅ 解决方案（3 步完成）

### 步骤 1：在 Vercel 控制台设置 Root Directory

1. 访问：https://vercel.com/dashboard
2. 选择你的项目 `ai-summary-app`
3. 点击 **Settings** 标签
4. 在左侧菜单选择 **General**
5. 找到 **Build & Development Settings** 部分
6. 在 **Root Directory** 下：
   - 点击 **Edit** 按钮
   - 输入：`my-app`
   - 点击 **Save**

> 📸 配置完成后应该显示：
> ```
> Root Directory: my-app
> Build Command: (使用默认值)
> Output Directory: (使用默认值)
> Install Command: (使用默认值)
> ```

---

### 步骤 2：添加环境变量

在同一个 Settings 页面：

1. 左侧菜单选择 **Environment Variables**
2. 添加以下 4 个变量：

#### 变量 1：
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://xggwdinlpgghlmxyjfeg.supabase.co`
- **Environment**: ☑️ Production, ☑️ Preview, ☑️ Development

#### 变量 2：
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: 从本地 `.env.local` 复制（运行 `cat my-app/.env.local`）
- **Environment**: ☑️ Production, ☑️ Preview, ☑️ Development

#### 变量 3：
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: 从本地 `.env.local` 复制
- **Environment**: ☑️ Production

#### 变量 4：
- **Name**: `ZHIPU_API_KEY`
- **Value**: 从本地 `.env.local` 复制
- **Environment**: ☑️ Production, ☑️ Preview, ☑️ Development

---

### 步骤 3：重新部署

1. 点击顶部的 **Deployments** 标签
2. 找到最新的失败部署
3. 点击右侧的 **...** 菜单
4. 选择 **Redeploy**
5. 确认 **Redeploy**

---

## ⏱️ 预计时间

- 配置 Root Directory: 1 分钟
- 添加环境变量: 2 分钟
- 重新部署: 3-5 分钟

**总计：约 6-8 分钟**

---

## ✅ 验证部署成功

部署完成后（状态变为 Ready），测试以下功能：

### 1. API 健康检查
```bash
curl https://your-app.vercel.app/api/health
```
**预期返回：**
```json
{"ok":true,"message":"Next.js backend is running"}
```

### 2. 文件列表 API
```bash
curl https://your-app.vercel.app/api/list
```

### 3. 在浏览器访问
- 首页：`https://your-app.vercel.app`
- 上传页面：`https://your-app.vercel.app/upload`
- 摘要页面：`https://your-app.vercel.app/summary`

---

## 📋 配置检查清单

在重新部署之前，确认：

- [ ] Root Directory 设置为 `my-app`
- [ ] Framework Preset 显示为 `Next.js` (自动检测)
- [ ] 4 个环境变量全部添加到 Production 环境
- [ ] 环境变量的值没有引号，没有多余空格

---

## 🔍 如果还是失败

### 查看构建日志
1. Deployments → 点击最新部署
2. 展开 **Building** 部分
3. 查看错误信息

### 常见错误

#### 错误 1: `Module not found`
**解决**: 确保 Root Directory 设置为 `my-app`

#### 错误 2: `Failed to compile`
**解决**: 本地运行 `cd my-app && npm run build` 检查是否有编译错误

#### 错误 3: 运行时 500 错误
**解决**: 检查环境变量是否正确设置

---

## 💡 为什么删除 vercel.json？

`vercel.json` 中的 shell 命令（如 `cd my-app &&`）在 Vercel 构建环境中不起作用。

**正确的做法是：**
1. 在 Vercel 控制台设置 Root Directory
2. Vercel 会自动进入该目录并执行标准的 Next.js 构建流程

这是 Vercel 官方推荐的 monorepo 配置方式。

---

## 📚 相关文档

- Vercel Root Directory 文档: https://vercel.com/docs/projects/project-configuration#root-directory
- Next.js 部署指南: https://nextjs.org/docs/deployment

---

## 🎯 总结

**需要做的：**
1. ✅ 在 Vercel 控制台设置 Root Directory 为 `my-app`
2. ✅ 添加 4 个环境变量
3. ✅ 重新部署

**不需要做的：**
- ❌ 不需要 vercel.json 文件
- ❌ 不需要修改代码
- ❌ 不需要手动设置 Build Command（使用默认值即可）

完成这 3 步后，你的应用就能成功部署了！🚀
