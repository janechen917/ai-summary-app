-- 创建摘要缓存表
-- 这个表用于缓存AI生成的摘要，避免重复调用API

CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL UNIQUE,  -- 文件名（作为唯一标识）
  summary TEXT NOT NULL,           -- AI生成的摘要
  text_length INTEGER,             -- 原文长度
  is_truncated BOOLEAN DEFAULT false,  -- 是否被截断
  warning TEXT,                    -- 警告信息（如截断提示）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引加快查询
CREATE INDEX IF NOT EXISTS idx_summaries_filename ON summaries(filename);
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON summaries(created_at DESC);

-- 添加RLS（行级安全）策略 - 允许所有操作（简化版）
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取缓存
CREATE POLICY "Enable read access for all users" ON summaries
  FOR SELECT USING (true);

-- 允许service role插入和更新
CREATE POLICY "Enable insert for service role" ON summaries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for service role" ON summaries
  FOR UPDATE USING (true);

-- 添加自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_summaries_updated_at
  BEFORE UPDATE ON summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 查看表结构
\d summaries;
