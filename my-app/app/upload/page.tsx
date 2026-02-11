"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    try {
      const res = await fetch("/api/list");
      const json = await res.json();
      setFiles(json.files || []);
    } catch (e) {
      console.error(e);
      setMessage("获取列表失败");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setMessage("请选择文件");
      return;
    }
    setLoading(true);
    setMessage("");
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setMessage(`❌ ${json.error || "上传失败"}`);
      } else {
        setMessage("✅ 上传成功！");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchList();
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ 上传出错");
    }
    setLoading(false);
  }

  async function onDelete(name: string) {
    if (!confirm("确认删除该文件吗？")) return;
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: name }),
      });
      const json = await res.json();
      if (!res.ok) setMessage(`❌ ${json.error || "删除失败"}`);
      else {
        setMessage("✅ 删除成功");
        fetchList();
      }
    } catch (e) {
      console.error(e);
      setMessage("❌ 删除出错");
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      setFile(droppedFiles[0]);
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

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
          background: "linear-gradient(90deg, #dc143c 0%, #b22222 100%)",
          padding: "24px",
          color: "#fff8dc"
        }}>
          <Link 
            href="/" 
            style={{ 
              color: "#ffe4e1", 
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
            color: "#fff8dc"
          }}>
            维尼的蜂蜜收集站           </h1>
          <p style={{ 
            margin: "8px 0 0", 
            opacity: 0.95,
            fontSize: "16px",
            color: "#ffe4e1"
          }}>
            
          </p>
        </div>

        {/* Upload Section */}
        <div style={{ padding: "32px" }}>
          <form onSubmit={onSubmit}>
            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `3px dashed ${dragOver ? "#daa520" : "#f4a460"}`,
                borderRadius: "20px",
                padding: "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: dragOver ? "#fff8dc" : "#fefefe",
                marginBottom: "24px",
                boxShadow: "0 6px 15px rgba(218, 165, 32, 0.2)"
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                {file ? "�" : "�"}
              </div>
              <h3 style={{ 
                margin: "0 0 8px", 
                color: "#8b4513",
                fontSize: "18px",
                fontWeight: "600"
              }}>
                {file ? `� 小熊得到了: ${file.name}` : "� 把蜂蜜文档放到这里吧!"}
              </h3>
              <p style={{ 
                margin: 0, 
                color: "#a0522d",
                fontSize: "14px"
              }}>
                {file 
                  ? `蜂蜜罐大小: ${formatFileSize(file.size)} �`
                  : "支持 PDF、DOC、图片等格式，像维尼一样爱惜哦~ �"
                }
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                style={{ display: "none" }}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
            </div>

            {/* Upload Button */}
            <button 
              type="submit" 
              disabled={loading || !file}
              style={{
                width: "100%",
                padding: "16px",
                background: loading || !file 
                  ? "#f5deb3" 
                  : "linear-gradient(90deg, #dc143c 0%, #b22222 100%)",
                color: loading || !file ? "#d2b48c" : "#fff8dc",
                border: "3px solid #daa520",
                borderRadius: "20px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading || !file ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: loading || !file ? "none" : "0 6px 15px rgba(220, 20, 60, 0.4)"
              }}
            >
              {loading ? "� 维尼在努力上传..." : file ? `� 把 ${file.name} 放进蜂蜜罐` : "� 选个蜂蜜文档吧~"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div style={{ 
              marginTop: "16px", 
              padding: "12px 16px",
              borderRadius: "20px",
              background: message.includes("✅") 
                ? "linear-gradient(90deg, #98fb98 0%, #90ee90 100%)"
                : "linear-gradient(90deg, #ffb6c1 0%, #ffa0ac 100%)",
              color: message.includes("✅") ? "#2e7d32" : "#c62828",
              border: `3px solid ${message.includes("✅") ? "#66bb6a" : "#ef5350"}`,
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 4px 12px rgba(218, 165, 32, 0.3)"
            }}>
              � {message}
            </div>
          )}
        </div>

        {/* File List Section */}
        <div style={{ 
          padding: "0 32px 32px",
          borderTop: "1px solid #f3f4f6"
        }}>
          <h2 style={{ 
            fontSize: "20px", 
            fontWeight: "600",
            color: "#8b4513",
            marginBottom: "20px",
            paddingTop: "24px"
          }}>
            � 维尼的蜂蜜收藏 ({files.length})
          </h2>
          
          {files.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#8b4513"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>�</div>
              <p style={{ margin: 0, fontSize: "16px" }}>蜂蜜罐还是空的呢，和维尼一起收集第一个蜂蜜文档吧！ �</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {files.map((item: any, index: number) => {
                const url = `${baseUrl}/storage/v1/object/public/documents/${encodeURIComponent(item.name)}`;
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name);
                
                return (
                  <div 
                    key={item.name} 
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px",
                      background: "linear-gradient(135deg, #fff8dc 0%, #f0e68c 100%)",
                      borderRadius: "16px",
                      border: "3px solid #daa520",
                      transition: "all 0.2s ease",
                      boxShadow: "0 4px 12px rgba(218, 165, 32, 0.3)"
                    }}
                  >
                    <div style={{ fontSize: "24px" }}>
                      {isImage ? "🖼️" : "�"}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#8b4513",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        � {item.name}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "#a0522d",
                        marginTop: "4px"
                      }}>
                        蜂蜜罐大小: {formatFileSize(item.metadata?.size || 0)} • 
                        收集时间: {new Date(item.created_at || item.updated_at).toLocaleDateString()} �
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "8px" }}>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          padding: "8px 16px",
                          background: "linear-gradient(90deg, #dc143c 0%, #b22222 100%)",
                          color: "#fff8dc",
                          textDecoration: "none",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          transition: "background 0.2s",
                          border: "2px solid #daa520"
                        }}
                      >
                        �️ 看蜂蜜
                      </a>
                      <button 
                        onClick={() => onDelete(item.name)}
                        style={{
                          padding: "8px 16px",
                          background: "linear-gradient(90deg, #ff6b6b 0%, #ee5a52 100%)",
                          color: "white",
                          border: "2px solid #daa520",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "background 0.2s"
                        }}
                      >
                        🗑️ 移除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 32px",
          background: "linear-gradient(90deg, #fff8dc 0%, #f0e68c 100%)",
          borderTop: "3px solid #daa520",
          textAlign: "center",
          fontSize: "12px",
          color: "#8b4513"
        }}>
          � 小提示：和维尼一起，把文档安全存放在云端的蜂蜜罐里 �✨
        </div>
      </div>
    </div>
  );
}
