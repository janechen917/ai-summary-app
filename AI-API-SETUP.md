# AI API 配置指南

## 智谱 AI (推荐 - 国内访问)

由于无法访问 OpenAI，本项目使用智谱 AI 作为替代方案。

### 获取 API Key 步骤：

1. **访问智谱 AI 开放平台**
   - 网址：https://open.bigmodel.cn/
   - 或搜索"智谱 AI 开放平台"

2. **注册/登录账号**
   - 支持手机号注册
   - 新用户有免费额度（约 1000 万 tokens）

3. **获取 API Key**
   - 登录后进入控制台
   - 点击左侧菜单 "API Keys"
   - 点击 "创建 API Key"
   - 复制生成的密钥（格式：`xxx.xxxxxxxxxxxxxxxxxx`）

4. **配置到项目**
   - 打开 `my-app/.env.local` 文件
   - 找到 `ZHIPU_API_KEY=your_zhipu_api_key_here`
   - 将 `your_zhipu_api_key_here` 替换为你的真实密钥

5. **重启开发服务器**
   ```bash
   cd my-app
   npm run dev
   ```

### 部署到 Vercel

在 Vercel 项目设置中添加环境变量：
- Key: `ZHIPU_API_KEY`
- Value: `你的智谱 AI API Key`

---

## 其他国内 AI 服务替代方案

### 1. 阿里云通义千问
- 官网：https://dashscope.aliyun.com/
- 需要阿里云账号
- 有免费额度

### 2. 百度文心一言
- 官网：https://cloud.baidu.com/product/wenxinworkshop
- 需要百度账号
- 审核后可用

### 3. DeepSeek
- 官网：https://platform.deepseek.com/
- API 格式兼容 OpenAI
- 价格便宜

---

## 模型说明

当前使用：**GLM-4-Flash**
- 速度快，响应时间短
- 成本低（约 OpenAI 的 1/10）
- 中文能力强

如需更高质量的摘要，可修改代码使用 **GLM-4**：
```typescript
model: "glm-4"  // 更强的能力，稍慢一些
```

---

## 常见问题

### Q: API Key 无效？
A: 检查是否正确复制，确保没有多余空格

### Q: 免费额度用完了？
A: 可以充值或切换到其他 AI 服务

### Q: 想换回 OpenAI？
A: 修改 `app/api/summary/route.ts`：
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // 删除 baseURL 行
});
```
并修改 `.env.local` 中的环境变量名。

---

## 技术细节

智谱 AI 的 API 兼容 OpenAI 格式，所以我们仍然使用 `openai` npm 包，只是：
1. 修改 `baseURL` 指向智谱 AI 的 API 地址
2. 使用智谱 AI 的 API Key
3. 使用智谱 AI 的模型名称（glm-4-flash / glm-4）

这样做的好处是：
- 代码改动最小
- 如果将来要切换到其他服务，很容易
- API 调用方式完全一致
