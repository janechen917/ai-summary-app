// 测试智谱 AI API 是否能正常调用
// 运行: node test-zhipu-api.js

require('./my-app/node_modules/dotenv').config({ path: './my-app/.env.local' });
const OpenAI = require('./my-app/node_modules/openai');

const openai = new OpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
});

async function testAPI() {
  console.log('🔍 开始测试智谱 AI API...');
  console.log('API Key (前8位):', process.env.ZHIPU_API_KEY?.substring(0, 8) + '...');
  console.log('');

  try {
    console.log('📡 发送测试请求...');
    const completion = await openai.chat.completions.create({
      model: "glm-4-flash",
      messages: [
        {
          role: "user",
          content: "请用一句话介绍智谱AI"
        }
      ],
      max_tokens: 100,
    });

    console.log('✅ API 调用成功！');
    console.log('');
    console.log('📝 响应内容:', completion.choices[0]?.message?.content);
    console.log('');
    console.log('📊 使用情况:');
    console.log('  - 模型:', completion.model);
    console.log('  - Tokens:', completion.usage);
    console.log('');
    console.log('💡 提示: 请等待 15-30 分钟后在控制台查看使用统计');
    console.log('   控制台地址: https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys');
    
  } catch (error) {
    console.error('❌ API 调用失败:', error.message);
    
    if (error.status === 429) {
      console.log('');
      console.log('⏰ 速率限制提示:');
      console.log('  - 原因: 请求过于频繁');
      console.log('  - 建议: 等待 1-2 分钟后重试');
      console.log('  - 注意: 429 错误的请求不会计入使用统计');
    } else if (error.status === 401) {
      console.log('');
      console.log('🔑 认证失败提示:');
      console.log('  - 请检查 API Key 是否正确');
      console.log('  - 确认 .env.local 中的 ZHIPU_API_KEY 配置');
    }
  }
}

testAPI();
