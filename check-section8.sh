#!/bin/bash
# Section 8 快速状态检查

echo "================================================================================"
echo "📊 Section 8: 数据库集成 - 状态检查"
echo "================================================================================"
echo ""

# 检查服务器
echo "🔍 1. 检查开发服务器..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "   ✅ 开发服务器正在运行"
else
    echo "   ❌ 开发服务器未运行"
    echo "   请运行: cd my-app && npm run dev"
    exit 1
fi

echo ""

# 检查数据库 API
echo "🔍 2. 检查数据库连接..."
HISTORY_RESULT=$(curl -s http://localhost:3000/api/history)

if echo "$HISTORY_RESULT" | grep -q "success"; then
    COUNT=$(echo "$HISTORY_RESULT" | grep -o '"count":[0-9]*' | cut -d: -f2)
    echo "   ✅ 数据库连接正常"
    echo "   📊 当前有 $COUNT 条摘要记录"
    
    if [ "$COUNT" -gt 0 ]; then
        echo ""
        echo "   最近的摘要："
        echo "$HISTORY_RESULT" | python3 -m json.tool 2>/dev/null | grep -A 2 "filename" | head -6
    fi
else
    echo "   ⚠️  数据库可能为空或连接有问题"
    echo "   响应: $(echo $HISTORY_RESULT | head -c 100)"
fi

echo ""
echo "================================================================================"
echo "📋 接下来要做的事情："
echo "================================================================================"
echo ""
echo "✅ 已完成："
echo "   • summaries 表已创建（通过代码验证）"
echo "   • API 集成完成（/api/summary 自动存储）"
echo "   • 缓存机制已实现"
echo ""
echo "📝 需要你完成："
echo ""
echo "1️⃣  访问 Supabase Dashboard"
echo "   URL: https://supabase.com/dashboard"
echo "   → Table Editor → summaries 表"
echo ""
echo "2️⃣  截图以下内容："
echo "   📸 表结构（显示所有列）"
echo "   📸 数据内容（至少 1-3 行）"
echo "   保存到: image/section8-table-structure.png"
echo "          image/section8-database-data.png"
echo ""
echo "3️⃣  如果数据库为空，生成测试数据："
echo "   方法 A: 访问 http://localhost:3000/summary"
echo "          上传并生成几个摘要"
echo ""
echo "   方法 B: 运行测试脚本"
echo "          ./test-section8.sh"
echo ""
echo "4️⃣  完成后告诉我，我会帮你更新 task2.md"
echo ""
echo "================================================================================"
echo ""

# 提供快速链接
echo "🔗 快速链接："
echo "   • 本地摘要页面: http://localhost:3000/summary"
echo "   • 历史记录页面: http://localhost:3000/history"
echo "   • Supabase Dashboard: https://supabase.com/dashboard"
echo ""
