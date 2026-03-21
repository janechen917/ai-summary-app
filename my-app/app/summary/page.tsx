"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function SummaryPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [textLength, setTextLength] = useState(0);
  const [warning, setWarning] = useState("");
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const STORAGE_KEY = 'summaryCooldownUntil';

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          const next = Math.max(0, prev - 1);
          if (next === 0) {
            try { localStorage.removeItem(STORAGE_KEY); } catch {};
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

  // on mount: restore cooldown from localStorage if present
  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(STORAGE_KEY) || '0');
      if (until && until > Date.now()) {
        const secs = Math.ceil((until - Date.now()) / 1000);
        setCooldownTime(secs);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  function startCooldown(seconds: number) {
    try {
      const until = Date.now() + seconds * 1000;
      localStorage.setItem(STORAGE_KEY, String(until));
    } catch (e) {
      // ignore storage errors
    }
    setCooldownTime(seconds);
  }

  async function fetchList() {
    try {
      const res = await fetch("/api/list");
      const json = await res.json();
      setFiles(json.files || []);
    } catch (e) {
      console.error(e);
      setMessage("获取文件列表失败");
    }
  }

  async function generateSummary() {
    if (!selectedFile) {
      setMessage("请选择一个文件");
      return;
    }

    if (cooldownTime > 0) {
      setMessage(`⏰ 请等待 ${cooldownTime} 秒后再试（防止速率限制）`);
      return;
    }

    setLoading(true);
    setMessage("");
    setSummary("");
    setTextLength(0);
    setWarning("");
    setErrorDetails(null);

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: selectedFile }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${json.error || "摘要生成失败"}`);
        if (json.details || json.solutions) {
          setErrorDetails({
            details: json.details,
            solutions: json.solutions,
            errorType: json.errorType
          });
        }
        // 如果是速率限制错误，设置更长的冷却时间
        if (json.errorType === 'RATE_LIMIT') {
          startCooldown(180); // 180 秒（3分钟）冷却 - 避免免费模型速率限制
        } else {
          startCooldown(30); // 其他错误 30 秒冷却
        }
      } else {
        setSummary(json.summary);
        setTextLength(json.textLength);
        setWarning(json.warning || "");
        setMessage(json.fromCache ? "✅ 从缓存加载摘要" : "✅ 摘要生成成功！");
        // 成功后设置 120 秒冷却，防止频繁请求
        startCooldown(120);
      }
    } catch (err: any) {
      console.error(err);
      setMessage("❌ 生成摘要时出错: " + err.message);
      startCooldown(15);
    }

    setLoading(false);
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #ffcc5c 0%, #d4af37 50%, #b8860b 100%)",
      padding: "20px"
    }}>
      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ 
          background: "linear-gradient(90deg, #1e90ff 0%, #4169e1 100%)",
          padding: "24px",
          color: "#fff"
        }}>
          <Link 
            href="/" 
            style={{ 
              color: "#e6f2ff", 
              textDecoration: "none",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              marginBottom: "12px"
            }}
          >
            ← 回到百亩森林
          </Link>
          <h1 style={{ 
            margin: 0, 
            fontSize: "28px", 
            fontWeight: "700",
            color: "#fff"
          }}>
            🧠 猫头鹰的智慧摘要
          </h1>
          <p style={{ 
            margin: "8px 0 0", 
            opacity: 0.95,
            fontSize: "16px",
            color: "#e6f2ff"
          }}>
            让 AI 为你的文档生成智能摘要
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: "32px 24px" }}>
          {/* File Selection */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600",
              color: "#2c3e50"
            }}>
              选择文档
            </label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #daa520",
                borderRadius: "12px",
                fontSize: "16px",
                backgroundColor: "#fffef0",
                cursor: "pointer"
              }}
            >
              <option value="">-- 请选择一个文件 --</option>
              {files.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateSummary}
            disabled={loading || !selectedFile || cooldownTime > 0}
            style={{
              width: "100%",
              padding: "16px",
              background: loading || !selectedFile || cooldownTime > 0
                ? "#cccccc"
                : "linear-gradient(90deg, #1e90ff 0%, #4169e1 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading || !selectedFile || cooldownTime > 0 ? "not-allowed" : "pointer",
              marginBottom: "20px",
              boxShadow: loading || !selectedFile || cooldownTime > 0
                ? "none" 
                : "0 4px 6px rgba(30, 144, 255, 0.3)"
            }}
          >
            {loading 
              ? "🧠 猫头鹰正在思考..." 
              : cooldownTime > 0
              ? `⏰ 冷却中 (${cooldownTime}秒)`
              : "✨ 生成摘要"}
          </button>

          {/* Message */}
          {message && (
            <div style={{
              padding: "12px",
              background: message.includes('❌') ? "#ffe6e6" : "#e6ffe6",
              borderRadius: "8px",
              marginBottom: "20px",
              color: "#2c3e50"
            }}>
              {message}
            </div>
          )}

          {/* Warning for truncated files */}
          {warning && (
            <div style={{
              padding: "12px 16px",
              background: "#fff3cd",
              borderRadius: "8px",
              marginBottom: "20px",
              color: "#856404",
              border: "1px solid #ffeaa7",
              display: "flex",
              alignItems: "start",
              gap: "8px"
            }}>
              <span style={{ fontSize: "18px" }}>⚠️</span>
              <div>
                <strong>提示：</strong> {warning}
              </div>
            </div>
          )}

          {/* Error Details and Solutions */}
          {errorDetails && (
            <div style={{
              padding: "16px",
              background: "#fff5f5",
              borderRadius: "12px",
              marginBottom: "20px",
              border: "2px solid #fc8181"
            }}>
              {errorDetails.errorType === 'RATE_LIMIT' && (
                <div style={{ marginBottom: "12px", fontSize: "32px", textAlign: "center" }}>
                  ⏰
                </div>
              )}
              
              {errorDetails.details && (
                <div style={{ 
                  marginBottom: "12px",
                  color: "#742a2a",
                  fontSize: "14px",
                  lineHeight: "1.6"
                }}>
                  <strong>详细说明：</strong><br />
                  {errorDetails.details}
                </div>
              )}
              
              {errorDetails.solutions && errorDetails.solutions.length > 0 && (
                <div style={{ color: "#742a2a" }}>
                  <strong style={{ fontSize: "14px" }}>💡 解决方案：</strong>
                  <ul style={{ 
                    margin: "8px 0 0 0", 
                    paddingLeft: "20px",
                    fontSize: "14px",
                    lineHeight: "1.6"
                  }}>
                    {errorDetails.solutions.map((solution: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: "4px" }}>{solution}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {errorDetails.errorType === 'RATE_LIMIT' && (
                <div style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  background: "#fed7d7",
                  borderRadius: "6px",
                  fontSize: "13px",
                  color: "#742a2a"
                }}>
                  <strong>提示：</strong>免费账户有速率限制，建议间隔 1-2 分钟再次尝试
                </div>
              )}
            </div>
          )}

          {/* Summary Result */}
          {summary && (
            <div style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: "20px",
              border: "2px solid #daa520"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ 
                  margin: 0,
                  color: "#2c3e50",
                  fontSize: "18px"
                }}>
                  📝 文档摘要
                </h3>
                <span style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  background: message.includes("缓存") ? "#e3f2fd" : "#ffe082",
                  color: message.includes("缓存") ? "#1976d2" : "#f57c00",
                  fontWeight: "600"
                }}>
                  {message.includes("缓存") ? "💾 缓存" : "🆕 新生成"}
                </span>
              </div>
              {textLength > 0 && (
                <p style={{ 
                  fontSize: "14px", 
                  color: "#666", 
                  marginBottom: "12px" 
                }}>
                  原文长度: {textLength} 字符
                </p>
              )}
              <div style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.6",
                color: "#2c3e50",
                fontSize: "15px"
              }}>
                {summary}
              </div>
            </div>
          )}

          {/* Tips */}
          {!summary && !loading && (
            <div style={{
              background: "#fff8e1",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "20px",
              border: "1px solid #ffd54f"
            }}>
              <h4 style={{ 
                marginTop: 0, 
                marginBottom: "8px",
                color: "#f57c00",
                fontSize: "16px"
              }}>
                💡 使用提示
              </h4>
              <ul style={{ 
                margin: 0, 
                paddingLeft: "20px",
                color: "#6d4c41",
                fontSize: "14px",
                lineHeight: "1.6"
              }}>
                <li>支持 .txt、.md 等文本格式文件</li>
                <li>最大支持 10 万字符（超出会自动截断）</li>
                <li>AI 摘要基于 GitHub Models（默认 gpt-4o-mini）</li>
                <li>生成时间约 3-10 秒，请耐心等待</li>
                <li><strong>💾 智能缓存：</strong>相同文件自动加载缓存摘要</li>
                <li><strong>⏰ 自动冷却：</strong>成功后等待 2 分钟，速率限制后 3 分钟</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
