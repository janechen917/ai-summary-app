'use client'

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [status, setStatus] = useState("Frontend running");
  const [loading, setLoading] = useState(false);

  async function checkBackend() {
    setLoading(true);
    setStatus("Checking backend...");
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setStatus(`✅ Backend says: ${data.message}`);
    } catch (error) {
      setStatus("❌ Backend connection failed");
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
        maxWidth: "900px", 
        margin: "0 auto",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ 
          background: "linear-gradient(90deg, #f4a460 0%, #daa520 100%)",
          padding: "40px 32px",
          color: "#8b4513",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>�</div>
          <h1 style={{ 
            margin: 0, 
            fontSize: "36px", 
            fontWeight: "700",
            marginBottom: "12px",
            color: "#8b4513"
          }}>
             Pooh's Document Forest 
          </h1>
          <p style={{ 
            margin: "0 auto",
            opacity: 0.9,
            fontSize: "18px",
            maxWidth: "500px",
            color: "#a0522d"
          }}>
           
          </p>
        </div>

        {/* Main Content */}
        <div style={{ padding: "40px 32px" }}>
          
          {/* Action Buttons */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "20px", 
            marginBottom: "32px" 
          }}>
            <button 
              onClick={checkBackend}
              disabled={loading}
              style={{
                padding: "20px 24px",
                background: loading 
                  ? "#f5deb3" 
                  : "linear-gradient(90deg, #dc143c 0%, #b22222 100%)",
                color: loading ? "#d2b48c" : "#fff8dc",
                border: "3px solid #daa520",
                borderRadius: "24px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: loading ? "none" : "0 6px 15px rgba(220, 20, 60, 0.4)"
              }}
            >
              <span style={{ fontSize: "20px" }}>{loading ? "🍯" : "�"}</span>
              {loading ? "维尼在检查..." : "CHECK BACKEND"}
            </button>
            
            <Link 
              href="/upload"
              style={{
                padding: "20px 24px",
                background: "linear-gradient(90deg, #ffcc5c 0%, #d4af37 100%)",
                color: "#8b4513",
                textDecoration: "none",
                borderRadius: "24px",
                fontSize: "16px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.3s ease",
                boxShadow: "0 6px 15px rgba(255, 204, 92, 0.4)",
                border: "3px solid #dc143c"
              }}
            >
              <span style={{ fontSize: "20px" }}>🍯</span>
              Files Upload
            </Link>
          </div>

          {/* Status Message */}
          {status && (
            <div style={{ 
              padding: "16px 20px",
              borderRadius: "20px",
              background: status.includes("✅") 
                ? "linear-gradient(90deg, #98fb98 0%, #90ee90 100%)"
                : status.includes("❌")
                ? "linear-gradient(90deg, #ffb6c1 0%, #ffa0ac 100%)"
                : "linear-gradient(90deg, #ffd700 0%, #ffb347 100%)",
              color: status.includes("✅") 
                ? "#2e7d32" 
                : status.includes("❌")
                ? "#c62828"
                : "#8b4513",
              fontSize: "15px",
              fontWeight: "500",
              textAlign: "center",
              border: `3px solid ${
                status.includes("✅") 
                ? "#66bb6a" 
                : status.includes("❌")
                ? "#ef5350"
                : "#daa520"
              }`,
              marginBottom: "32px",
              boxShadow: "0 4px 12px rgba(218, 165, 32, 0.3)"
            }}>
              � {status}
            </div>
          )}
          
          {/* Features Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
            marginBottom: "32px"
          }}>
            
           
          </div>

          {/* Tech Stack */}
          <div style={{
            padding: "24px",
            background: "#f9fafb",
            borderRadius: "12px",
            border: "2px solid #e5e7eb"
          }}>
            <h3 style={{
              margin: "0 0 16px",
              color: "#374151",
              fontSize: "18px",
              fontWeight: "600",
              textAlign: "center"
            }}>
              🛠️ 技术栈
            </h3>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center"
            }}>
              {[
                { name: "Next.js", color: "#000000" },
                { name: "Supabase", color: "#3ecf8e" },
                { name: "TypeScript", color: "#3178c6" },
                { name: "Vercel", color: "#000000" }
              ].map(tech => (
                <span
                  key={tech.name}
                  style={{
                    padding: "6px 12px",
                    background: "white",
                    color: tech.color,
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                    border: `1px solid ${tech.color}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "20px 32px",
          background: "#f9fafb",
          borderTop: "2px solid #e5e7eb",
          textAlign: "center",
          fontSize: "14px",
          color: "#6b7280"
        }}>
          <p style={{ margin: "0 0 8px" }}>
            💡 <strong>开始使用：</strong> 点击"文档上传"开始体验智能文档处理 
          </p>
          <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>
            Powered by Next.js + Supabase + AI
          </p>
        </div>
      </div>
    </div>
  );
}