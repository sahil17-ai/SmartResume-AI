import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../config";
const STAT_CARDS = [
  { label: "Resume Score", value: "—", icon: "◎", color: "#6c63ff", sub: "Analyze your resume to get score" },
  { label: "Grade", value: "—", icon: "✦", color: "#f59e0b", sub: "Based on AI analysis" },
  { label: "Match %", value: "—", icon: "◈", color: "#00e5a0", sub: "Paste JD to see match" },
];

export default function Dashboard({ navigate }) {
  const { user, token, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [resumes, setResumes] = useState([]);

  const handleLogout = () => { logout(); navigate("landing"); };

  useEffect(() => {
    if (token) {
      fetch(`${API}/api/resume/`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : [])
        .then(data => setResumes(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 80 }}>
      <nav className="nav">
        <div className="nav-logo" onClick={() => navigate("landing")} style={{ cursor: "pointer" }}>SmartResume AI</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-primary" onClick={() => navigate("templates")} style={{ fontSize: 13 }}>+ New Resume</button>
          {user && (
            <div style={{ position: "relative" }}>
              <div onClick={() => setShowMenu(m => !m)} style={{
                width: 38, height: 38, borderRadius: "50%", background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#fff",
                border: "2px solid var(--border)", userSelect: "none",
              }}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              {showMenu && (
                <div style={{
                  position: "absolute", right: 0, top: 48, background: "var(--surface)",
                  border: "1px solid var(--border)", borderRadius: 14, padding: "8px 0",
                  minWidth: 180, zIndex: 100, boxShadow: "var(--shadow)",
                  animation: "fadeIn 0.15s ease",
                }}>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                    <div style={{ color: "var(--text2)", fontSize: 12 }}>{user.email}</div>
                  </div>
                  <button onClick={handleLogout} style={{
                    width: "100%", background: "none", border: "none", padding: "10px 16px",
                    textAlign: "left", cursor: "pointer", color: "#ef4444", fontSize: 14,
                  }}>Sign Out</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "var(--font-display)", marginBottom: 6 }}>
            Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0] || "there"}</span> 👋
          </h1>
          <p style={{ color: "var(--text2)" }}>Manage your resumes and track your AI scores.</p>
        </div>

        {/* Score Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
          {STAT_CARDS.map(card => (
            <div key={card.label} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 20, padding: "24px 20px",
              transition: "border-color 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.color + "55"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "var(--text2)", fontSize: 13, fontWeight: 500 }}>{card.label}</span>
                <span style={{ fontSize: 20, color: card.color }}>{card.icon}</span>
              </div>
              <div style={{ fontSize: 36, fontFamily: "var(--font-display)", fontWeight: 800, color: card.color, marginBottom: 4 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div style={{ textAlign: "center", padding: "60px 40px", background: "var(--surface)", borderRadius: 24, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>◎</div>
          <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>No resumes yet</h3>
          <p style={{ color: "var(--text2)", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
            Build your first AI-powered resume and get your selection score.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("templates")} style={{ padding: "14px 32px", fontSize: 15 }}>
            Build Resume →
          </button>
        </div>
      </div>
    </div>
  );
}
