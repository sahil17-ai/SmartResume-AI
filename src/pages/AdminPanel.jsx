import { useState, useEffect } from "react";
import API from "../config";
export default function AdminPanel({ navigate }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("sr_admin_token"));
  const [email, setEmail] = useState("admin@smartresume.com");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [resetTarget, setResetTarget] = useState(null);
  const [newPass, setNewPass] = useState("");N

  useEffect(() => {
    if (adminToken) fetchStats();
  }, [adminToken]);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) { setAdminToken(null); localStorage.removeItem("sr_admin_token"); return; }
      const data = await res.json();
      setStats(data);
    } catch { }
    setLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.detail || "Login failed"); return; }
      localStorage.setItem("sr_admin_token", data.token);
      setAdminToken(data.token);
    } catch { setLoginError("Connection error"); }
  }

  async function handleDelete(userEmail) {
    if (!confirm(`Delete "${userEmail}"?`)) return;
    const res = await fetch(`${API}/api/admin/users/${encodeURIComponent(userEmail)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    setMsg(data.message || data.detail);
    fetchStats();
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    const res = await fetch(`${API}/api/admin/users/${encodeURIComponent(resetTarget)}/reset-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPass }),
    });
    const data = await res.json();
    setMsg(data.message || data.detail);
    setResetTarget(null);
    setNewPass("");
  }

  function logout() {
    setAdminToken(null);
    localStorage.removeItem("sr_admin_token");
    setStats(null);
  }

  // Login screen
  if (!adminToken) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0f23", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#1a1a2e", border: "1px solid #7c3aed", borderRadius: 16, padding: 40, width: 380, boxShadow: "0 0 40px #7c3aed44" }}>
          <h2 style={{ color: "#a78bfa", marginBottom: 8, textAlign: "center" }}>🔐 Admin Login</h2>
          <p style={{ color: "#6b7280", textAlign: "center", marginBottom: 24, fontSize: 14 }}>SmartResume Admin Panel</p>
          {loginError && <div style={{ background: "#7f1d1d", color: "#fca5a5", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{loginError}</div>}
          <form onSubmit={handleLogin}>
            <label style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 4 }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
              style={{ width: "100%", padding: "10px 12px", background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#f3f4f6", marginBottom: 14, boxSizing: "border-box" }} />
            <label style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 4 }}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required
              style={{ width: "100%", padding: "10px 12px", background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#f3f4f6", marginBottom: 20, boxSizing: "border-box" }} />
            <button type="submit"
              style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
              Login as Admin
            </button>
          </form>
          <button onClick={() => navigate("landing")} style={{ marginTop: 16, width: "100%", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13 }}>← Back to Site</button>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div style={{ minHeight: "100vh", background: "#0f0f23", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: "#a78bfa", margin: 0, fontSize: 24 }}>🛡️ Admin Panel</h1>
          <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: 13 }}>SmartResume Management</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={fetchStats} style={btnStyle("#1e3a5f", "#60a5fa")}>🔄 Refresh</button>
          <button onClick={() => navigate("landing")} style={btnStyle("#1a2e1a", "#4ade80")}>🌐 View Site</button>
          <button onClick={logout} style={btnStyle("#3b1a1a", "#f87171")}>🚪 Logout</button>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div style={{ background: "#14532d", color: "#86efac", padding: "10px 16px", borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
          ✅ {msg}
          <button onClick={() => setMsg("")} style={{ float: "right", background: "none", border: "none", color: "#86efac", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {loading ? (
        <div style={{ color: "#6b7280", textAlign: "center", padding: 60 }}>Loading...</div>
      ) : stats ? (
        <>
          {/* Stats Card */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
            <StatCard icon="👥" label="Total Users" value={stats.total_users} color="#7c3aed" />
            <StatCard icon="📄" label="Total Resumes" value={stats.users.reduce((a, u) => a + (u.resume_count || 0), 0)} color="#0ea5e9" />
          </div>

          {/* Users Table */}
          <div style={{ background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #2d2d44" }}>
              <h3 style={{ color: "#e5e7eb", margin: 0, fontSize: 16 }}>👤 Registered Users</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#111827" }}>
                    {["Name", "Email", "Resumes", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", color: "#9ca3af", textAlign: "left", fontSize: 13, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.users.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: 24, color: "#6b7280", textAlign: "center" }}>No users yet</td></tr>
                  ) : stats.users.map((u, i) => (
                    <tr key={u.email} style={{ borderTop: "1px solid #1f2937", background: i % 2 === 0 ? "transparent" : "#111827" }}>
                      <td style={{ padding: "12px 16px", color: "#f3f4f6", fontSize: 14 }}>{u.name}</td>
                      <td style={{ padding: "12px 16px", color: "#a78bfa", fontSize: 14 }}>{u.email}</td>
                      <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 14 }}>{u.resume_count || 0}</td>
                      <td style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
                        <button onClick={() => { setResetTarget(u.email); setNewPass(""); }} style={btnStyle("#1e3a5f", "#60a5fa", true)}>🔑 Reset Pass</button>
                        <button onClick={() => handleDelete(u.email)} style={btnStyle("#3b1a1a", "#f87171", true)}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#1a1a2e", border: "1px solid #7c3aed", borderRadius: 14, padding: 32, width: 340 }}>
            <h3 style={{ color: "#a78bfa", marginTop: 0 }}>🔑 Reset Password</h3>
            <p style={{ color: "#9ca3af", fontSize: 13 }}>{resetTarget}</p>
            <form onSubmit={handleResetPassword}>
              <input value={newPass} onChange={e => setNewPass(e.target.value)} type="password" placeholder="New password (min 6 chars)" required minLength={6}
                style={{ width: "100%", padding: "10px 12px", background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#f3f4f6", marginBottom: 16, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={{ flex: 1, ...btnStyle("#4c1d95", "#a78bfa") }}>Save</button>
                <button type="button" onClick={() => setResetTarget(null)} style={{ flex: 1, ...btnStyle("#1f2937", "#9ca3af") }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "#1a1a2e", border: `1px solid ${color}44`, borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>{label}</div>
      <div style={{ color, fontSize: 32, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function btnStyle(bg, color, small = false) {
  return {
    background: bg,
    color,
    border: `1px solid ${color}55`,
    borderRadius: 8,
    padding: small ? "6px 12px" : "8px 16px",
    cursor: "pointer",
    fontSize: small ? 12 : 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
}
