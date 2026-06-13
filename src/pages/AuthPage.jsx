import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ navigate }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (mode === "register" && !form.name) { setError("Name is required."); return; }
    if (mode === "register" && form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!form.email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate("dashboard");
    } catch (e) {
      if (e.message === "Failed to fetch" || e.message.includes("NetworkError")) {
        setError("Cannot connect to server. Make sure the backend is running on port 8000.");
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Back */}
        <button className="btn btn-ghost" onClick={() => navigate("landing")} style={{ marginBottom: 24, fontSize: 13 }}>
          ← Back
        </button>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, padding: "40px 36px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>◎</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, marginBottom: 6 }}>
              SmartResume <span className="gradient-text">AI</span>
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>
              {mode === "login" ? "Welcome back! Sign in to continue." : "Create your free account."}
            </p>
          </div>

          {/* Toggle */}
          <div style={{ display: "flex", background: "var(--bg)", borderRadius: 50, padding: 4, marginBottom: 28, gap: 4 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: "10px 0", borderRadius: 50, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                  background: mode === m ? "var(--accent)" : "transparent",
                  color: mode === m ? "#fff" : "var(--text2)", transition: "all 0.2s" }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Fields */}
          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label className="label">Full Name</label>
              <input className="input" placeholder="Jane Doe" value={form.name}
                onChange={e => set("name", e.target.value)} style={{ marginTop: 6 }} />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="jane@example.com" value={form.email}
              onChange={e => set("email", e.target.value)} style={{ marginTop: 6 }}
              onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => set("password", e.target.value)} style={{ marginTop: 6 }}
              onKeyDown={e => e.key === "Enter" && submit()} />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#ef4444", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" onClick={submit} disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "14px 0", fontSize: 15 }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              mode === "login" ? "Sign In →" : "Create Account →"
            )}
          </button>

          <p style={{ textAlign: "center", marginTop: 20, color: "var(--text2)", fontSize: 13 }}>
            {mode === "login" ? "No account? " : "Already registered? "}
            <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 500 }}>
              {mode === "login" ? "Sign up free" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
