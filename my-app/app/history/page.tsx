"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface SummaryRecord {
  id: string;
  filename: string;
  summary: string;
  textLength: number;
  isTruncated: boolean;
  warning?: string;
  createdAt: string;
  updatedAt: string;
}

export default function HistoryPage() {
  const [summaries, setSummaries] = useState<SummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSummary, setSelectedSummary] = useState<SummaryRecord | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      setLoading(true);
      const res = await fetch("/api/history");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "获取历史记录失败");
      }
      
      setSummaries(data.summaries || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "获取历史记录失败");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert("✅ 摘要已复制到剪贴板！");
    }).catch(err => {
      console.error('复制失败:', err);
      alert("❌ 复制失败");
    });
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ 
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          padding: "24px",
          color: "white"
        }}>
          <Link 
            href="/" 
            style={{ 
              color: "rgba(255,255,255,0.9)", 
              textDecoration: "none",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              marginBottom: "12px"
            }}
          >
            ← 回到首页
          </Link>
          <h1 style={{ 
            margin: 0, 
            fontSize: "28px", 
            fontWeight: "700"
          }}>
            📚 摘要历史记录
          </h1>
          <p style={{ 
            margin: "8px 0 0", 
            opacity: 0.95,
            fontSize: "16px"
          }}>
            查看所有 AI 生成的文档摘要
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
              <p>加载历史记录...</p>
            </div>
          )}

          {error && (
            <div style={{
              padding: "16px",
              background: "#fee",
              border: "2px solid #fcc",
              borderRadius: "12px",
              color: "#c33",
              marginBottom: "20px"
            }}>
              ❌ {error}
            </div>
          )}

          {!loading && !error && summaries.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
              <p style={{ fontSize: "18px", marginBottom: "8px" }}>还没有生成过摘要</p>
              <p style={{ fontSize: "14px", color: "#999" }}>
                去<Link href="/upload" style={{ color: "#667eea" }}>上传页面</Link>上传文件并生成摘要吧！
              </p>
            </div>
          )}

          {!loading && !error && summaries.length > 0 && (
            <>
              <div style={{ 
                marginBottom: "20px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center" 
              }}>
                <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                  共 <strong>{summaries.length}</strong> 条记录
                </p>
                <button
                  onClick={fetchHistory}
                  style={{
                    padding: "8px 16px",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  🔄 刷新
                </button>
              </div>

              <div style={{ display: "grid", gap: "16px" }}>
                {summaries.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      padding: "20px",
                      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                      borderRadius: "12px",
                      border: "2px solid #e0e7ff",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start",
                      marginBottom: "12px"
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          margin: "0 0 8px", 
                          fontSize: "16px",
                          color: "#1a202c",
                          fontWeight: "600"
                        }}>
                          📄 {item.filename}
                        </h3>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                          ⏰ {formatDate(item.createdAt)} • 
                          📊 {item.textLength.toLocaleString()} 字符
                          {item.isTruncated && " • ⚠️ 已截断"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setSelectedSummary(item)}
                          style={{
                            padding: "6px 12px",
                            background: "#667eea",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                          }}
                        >
                          👁️ 查看
                        </button>
                        <button
                          onClick={() => copyToClipboard(item.summary)}
                          style={{
                            padding: "6px 12px",
                            background: "#48bb78",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      padding: "12px",
                      background: "rgba(255,255,255,0.8)",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#4a5568",
                      lineHeight: "1.6",
                      maxHeight: "80px",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {item.summary.substring(0, 150)}
                      {item.summary.length > 150 && "..."}
                    </div>

                    {item.warning && (
                      <div style={{
                        marginTop: "8px",
                        padding: "8px 12px",
                        background: "#fff3cd",
                        border: "1px solid #ffc107",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#856404"
                      }}>
                        ⚠️ {item.warning}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 32px",
          background: "#f7fafc",
          borderTop: "1px solid #e2e8f0",
          textAlign: "center",
          fontSize: "12px",
          color: "#718096"
        }}>
          💡 提示：点击"查看"按钮查看完整摘要 • 点击"📋"快速复制
        </div>
      </div>

      {/* Modal for full summary */}
      {selectedSummary && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000
          }}
          onClick={() => setSelectedSummary(null)}
        >
          <div 
            style={{
              background: "white",
              borderRadius: "16px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              padding: "32px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "flex-start",
              marginBottom: "20px"
            }}>
              <div>
                <h2 style={{ margin: "0 0 8px", fontSize: "20px", color: "#1a202c" }}>
                  📄 {selectedSummary.filename}
                </h2>
                <p style={{ margin: 0, fontSize: "14px", color: "#718096" }}>
                  {formatDate(selectedSummary.createdAt)} • {selectedSummary.textLength.toLocaleString()} 字符
                </p>
              </div>
              <button
                onClick={() => setSelectedSummary(null)}
                style={{
                  padding: "8px 12px",
                  background: "#e53e3e",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                ✕ 关闭
              </button>
            </div>

            {selectedSummary.warning && (
              <div style={{
                marginBottom: "16px",
                padding: "12px 16px",
                background: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#856404"
              }}>
                ⚠️ {selectedSummary.warning}
              </div>
            )}

            <div style={{
              padding: "20px",
              background: "#f7fafc",
              borderRadius: "12px",
              fontSize: "15px",
              lineHeight: "1.8",
              color: "#2d3748",
              whiteSpace: "pre-wrap",
              marginBottom: "16px"
            }}>
              {selectedSummary.summary}
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => copyToClipboard(selectedSummary.summary)}
                style={{
                  padding: "10px 20px",
                  background: "#48bb78",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                📋 复制摘要
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
