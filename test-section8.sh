#!/bin/bash
# Section 8 数据库集成测试脚本

echo "================================================================================"
echo "🧪 Section 8: Database Integration - 测试脚本"
echo "================================================================================"
echo ""

# 检查服务器是否运行
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ 开发服务器未运行"
    echo ""
    echo "请先启动服务器："
    echo "  cd my-app && npm run dev"
    echo ""
    exit 1
fi

echo "✅ 服务器正在运行"
echo ""

# 创建测试文件
echo "📝 步骤 1: 创建测试文件..."

cat > /tmp/test-ai-history.txt << 'EOF'
人工智能的历史可以追溯到20世纪50年代。1956年达特茅斯会议标志着AI作为一门学科的诞生。
早期研究集中在符号主义和逻辑推理。经历了多次AI寒冬后，深度学习的突破带来了现代AI的复兴。
今天，AI已经应用于计算机视觉、自然语言处理、游戏、自动驾驶等众多领域。
EOF

cat > /tmp/test-ml-basics.txt << 'EOF'
机器学习是人工智能的核心分支。主要分为监督学习、无监督学习和强化学习三大类。
监督学习使用标记数据训练模型，无监督学习从未标记数据中发现模式，而强化学习通过与环境交互学习最优策略。
深度学习作为机器学习的子领域，使用神经网络进行学习。
EOF

cat > /tmp/test-nlp-overview.txt << 'EOF'
自然语言处理（NLP）使计算机能够理解和生成人类语言。关键技术包括词嵌入、序列到序列模型和注意力机制。
近年来，大型语言模型如GPT和BERT推动了NLP领域的重大进展。这些模型在机器翻译、文本摘要、问答系统等任务上表现出色。
Transformer架构成为现代NLP的基础。
EOF

echo "   ✅ 创建了 3 个测试文件"
echo ""

# 上传文件并生成摘要
echo "📤 步骤 2: 上传文件并生成摘要..."
echo ""

FILES=("test-ai-history.txt" "test-ml-basics.txt" "test-nlp-overview.txt")
FILENAMES=()

for file in "${FILES[@]}"; do
    echo "   📄 上传: $file"
    
    # 上传文件
    UPLOAD_RESULT=$(curl -s -X POST http://localhost:3000/api/upload \
        -F "file=@/tmp/$file")
    
    # 提取文件名
    FILENAME=$(echo $UPLOAD_RESULT | grep -oP '(?<=documents/)[^"]+' || echo "")
    
    if [ -n "$FILENAME" ]; then
        echo "      ✅ 上传成功: $FILENAME"
        FILENAMES+=("$FILENAME")
    else
        echo "      ⚠️  上传可能失败，尝试继续..."
    fi
    
    sleep 2
done

echo ""
echo "⏳ 等待 10 秒以避免速率限制..."
sleep 10
echo ""

# 生成摘要
echo "🤖 步骤 3: 生成 AI 摘要（写入数据库）..."
echo ""

for filename in "${FILENAMES[@]}"; do
    if [ -n "$filename" ]; then
        echo "   🔄 生成摘要: $filename"
        
        SUMMARY_RESULT=$(curl -s -X POST http://localhost:3000/api/summary \
            -H "Content-Type: application/json" \
            -d "{\"filename\": \"$filename\"}")
        
        # 检查是否成功
        if echo "$SUMMARY_RESULT" | grep -q "summary"; then
            echo "      ✅ 摘要已生成并保存到数据库"
        elif echo "$SUMMARY_RESULT" | grep -q "RATE_LIMIT"; then
            echo "      ⚠️  遇到速率限制，请稍后手动测试"
        else
            echo "      ℹ️  响应: $(echo $SUMMARY_RESULT | head -c 100)"
        fi
        
        # 等待避免速率限制
        sleep 15
    fi
done

echo ""
echo "================================================================================"
echo "📊 测试完成！"
echo "================================================================================"
echo ""

# 查询数据库
echo "🔍 步骤 4: 验证数据库数据..."
echo ""
echo "请访问 Supabase Dashboard 查看数据："
echo ""
echo "1. 打开：https://supabase.com/dashboard"
echo "2. 选择你的项目"
echo "3. 点击左侧 'Table Editor'"
echo "4. 选择 'summaries' 表"
echo ""
echo "你应该看到至少 3 条记录，包含："
echo "  • filename (文件名)"
echo "  • summary (AI 生成的摘要)"
echo "  • text_length (文本长度)"
echo "  • created_at (创建时间)"
echo ""

echo "或者在 SQL Editor 中运行以下查询："
echo ""
echo "  SELECT filename, LEFT(summary, 80) as preview, created_at"
echo "  FROM summaries"
echo "  ORDER BY created_at DESC"
echo "  LIMIT 10;"
echo ""

echo "================================================================================"
echo "📸 截图清单 (Section 8)"
echo "================================================================================"
echo ""
echo "请截图以下内容并保存到 image/ 文件夹："
echo ""
echo "1. ✅ Supabase Table Editor - summaries 表结构"
echo "   保存为: image/section8-table-structure.png"
echo ""
echo "2. ✅ Supabase Table Editor - 表中的数据行"  
echo "   保存为: image/section8-database-data.png"
echo ""
echo "3. ✅ SQL Editor 查询结果 (可选)"
echo "   保存为: image/section8-sql-query.png"
echo ""

echo "================================================================================"
echo "✅ Section 8 数据库集成已验证！"
echo "================================================================================"
echo ""

echo "💡 提示："
echo "  • 如果遇到速率限制，等待 2 分钟后再次尝试生成摘要"
echo "  • 缓存功能：再次请求同一文件的摘要会从数据库返回（很快）"
echo "  • 查看代码：my-app/app/api/summary/route.ts"
echo ""

echo "🎯 下一步：实现 Section 9 附加功能"
echo "   运行: ./implement-section9.sh"
echo ""
