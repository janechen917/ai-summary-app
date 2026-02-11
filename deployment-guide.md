# Vercel 部署指南 🚀

## 第1步: 准备 Vercel 账号

1. **注册 Vercel 账号**
   - 访问 https://vercel.com
   - 点击 "Sign Up" 
   - 选择 "Continue with GitHub" 使用 GitHub 账号登录
   - 授权 Vercel 访问你的 GitHub 仓库

## 第2步: 导入项目

1. **登录后点击 "New Project"**
2. **选择从 GitHub 导入**
   - 找到 `janechen917/ai-summary-app` 仓库
   - 点击 "Import"

3. **配置项目设置**
   ```
   Framework Preset: Next.js
   Root Directory: my-app
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

## 第3步: 配置环境变量 ⚠️

**重要：在 Vercel 中手动添加以下环境变量**

1. 点击 "Environment Variables" 标签页
2. 添加以下变量：

```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务密钥
```

**获取 Supabase 密钥的方法：**
- 登录 Supabase Dashboard: https://supabase.com/dashboard
- 选择你的项目
- 进入 Settings → API
- 复制相应的密钥值

## 第4步: 部署

1. **点击 "Deploy"**
2. **等待部署完成** (通常需要 1-3 分钟)
3. **获取部署 URL** (格式如：`https://your-app-name.vercel.app`)

## 第5步: 验证部署

### 基础验证
1. **访问主页**
   - 打开部署的 URL
   - 确认小熊维尼主题显示正常
   - 检查导航链接工作

2. **API 健康检查**
   ```bash
   curl https://your-app-name.vercel.app/api/health
   ```
   应该返回：`{"message":"API is working","timestamp":"..."}`

### 功能验证
1. **文件上传测试**
   - 访问 `/upload` 页面
   - 测试拖拽上传功能
   - 测试点击上传功能

2. **文件管理测试**
   - 验证文件列表显示
   - 测试文件下载
   - 测试文件删除

## 第6步: 验证 Supabase 存储

1. **登录 Supabase Dashboard**
2. **检查 Storage**
   - 进入 Storage → your-bucket
   - 确认上传的文件显示在这里
   - 验证文件可以正常访问

## 故障排除

### 常见问题
1. **环境变量错误**
   - 检查 Vercel 中的环境变量是否正确设置
   - 确保没有多余的空格或引号

2. **Supabase 连接失败**
   - 验证 Supabase URL 格式正确（不包含 `/` 结尾）
   - 确认 API 密钥有效且权限正确

3. **文件上传失败**
   - 检查 Supabase Storage 中的 RLS 策略
   - 确认 bucket 是公开的或策略允许匿名访问

### 调试方法
```bash
# 检查 API 端点
curl -X GET https://your-app-name.vercel.app/api/list

# 测试文件上传
curl -X POST -F "file=@test.txt" https://your-app-name.vercel.app/api/upload
```

## 部署成功标志 ✅

- [ ] 主页正常显示小熊维尼主题
- [ ] 文件上传功能正常工作
- [ ] 文件列表和删除功能正常
- [ ] API 健康检查通过
- [ ] Supabase 存储中能看到上传的文件