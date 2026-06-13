import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const STATS = [
  { value: "50K+", label: "Resumes Built" },
  { value: "89%", label: "Selection Rate" },
  { value: "200+", label: "Companies Hiring" },
  { value: "4.9★", label: "User Rating" },
];

const FEATURES = [
  { icon: "✦", title: "AI-Powered Templates", desc: "Smart templates for every industry — Tech, Finance, Marketing, Design, HR and more.", color: "#6c63ff" },
  { icon: "◈", title: "JD-Match Technology", desc: "Paste a job description and AI rewrites your resume to match it perfectly.", color: "#00e5a0" },
  { icon: "◎", title: "Selection Predictor", desc: "ML model scores your resume and tells you exactly what to improve for higher chances.", color: "#f59e0b" },
  { icon: "⊞", title: "Live Customization", desc: "Real-time preview. Change fonts, colors, layouts — see it instantly.", color: "#ec4899" },
  { icon: "⬡", title: "ATS Optimizer", desc: "Beat Applicant Tracking Systems with keyword-optimized formatting.", color: "#06b6d4" },
  { icon: "❋", title: "One-Click PDF Export", desc: "Download pixel-perfect PDF directly — no print dialog, straight to your device.", color: "#8b5cf6" },
];

const TYPING_TEXTS = [
  "Data Scientist Resume",
  "Software Engineer CV",
  "Financial Analyst Profile",
  "Marketing Manager Resume",
  "UI/UX Designer Portfolio",
  "ML Engineer Resume",
  "Product Manager CV",
  "Business Analyst Profile",
];

const DEMO_STEPS = [
  { step: 1, title: "Choose Your Template", desc: "Pick from 10+ industry-specific templates — Tech, Finance, Marketing, Design, ATS-optimized and more.", icon: "⊞", color: "#6c63ff" },
  { step: 2, title: "Fill Your Information", desc: "Smart form adapts based on your template. Add education, experience, skills, projects, internships and certifications.", icon: "◎", color: "#00e5a0" },
  { step: 3, title: "Customize the Look", desc: "Change fonts, colors, layout and spacing in real-time. See changes instantly in the live preview panel.", icon: "◈", color: "#f59e0b" },
  { step: 4, title: "AI Score & JD Match", desc: "Get your AI selection score across 6 dimensions. Paste a job description to see keyword match % and what to add.", icon: "✦", color: "#ec4899" },
  { step: 5, title: "Export as PDF", desc: "Click Export PDF — file downloads directly to your device. No print dialog. Clean A4 format, ready to send.", icon: "❋", color: "#8b5cf6" },
];

export default function LandingPage({ navigate }) {
  const { user } = useAuth();
  const [typingIndex, setTypingIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Typing animation
  useEffect(() => {
    const target = TYPING_TEXTS[typingIndex];
    let timeout;
    if (!isDeleting && displayText.length < target.length) {
      timeout = setTimeout(() => setDisplayText(target.slice(0, displayText.length + 1)), 75);
    } else if (!isDeleting && displayText.length === target.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 35);
    } else {
      setIsDeleting(false);
      setTypingIndex((i) => (i + 1) % TYPING_TEXTS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, typingIndex]);

  // Mouse parallax
  useEffect(() => {
    const h = (e) => setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 30, y: (e.clientY / window.innerHeight - 0.5) * 30 });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  // Demo auto-advance
  useEffect(() => {
    if (!showDemo) return;
    const t = setInterval(() => setDemoStep((s) => (s + 1) % DEMO_STEPS.length), 3500);
    return () => clearInterval(t);
  }, [showDemo]);

  return (
    <div className="noise" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">SmartResume AI</div>
        <div className="nav-links">
          <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowDemo(true)}>Demo</button>
          <button className="btn btn-ghost" style={{ fontSize: 13 }}>Pricing</button>
          <button className="btn btn-ghost" onClick={() => navigate("admin")} style={{ fontSize: 11, opacity: 0.5, border: "1px solid var(--border)", padding: "6px 12px" }}
            onMouseOver={e => e.currentTarget.style.opacity = "1"}
            onMouseOut={e => e.currentTarget.style.opacity = "0.5"}>
            ⚙ Admin
          </button>
          {user ? (
            <button className="btn btn-ghost" onClick={() => navigate("dashboard")} style={{ fontSize: 13 }}>
              Dashboard →
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={() => navigate("auth")} style={{ fontSize: 13 }}>
              Sign In
            </button>
          )}
          <button className="btn btn-primary" onClick={() => navigate("templates")} style={{ padding: "10px 20px", fontSize: 13 }}>
            Build Resume →
          </button>
        </div>
      </nav>

      {/* ── Demo Modal ── */}
      {showDemo && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.3s ease",
        }} onClick={() => setShowDemo(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 24, width: "min(720px, 95vw)", overflow: "hidden",
            boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
            animation: "scaleIn 0.3s cubic-bezier(0.22,1,0.36,1)",
          }}>
            {/* Modal header */}
            <div style={{ background: "var(--gradient)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>How SmartResume AI Works</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>5 simple steps to your perfect resume</div>
              </div>
              <button onClick={() => setShowDemo(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Step dots */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "20px 0 0" }}>
              {DEMO_STEPS.map((_, i) => (
                <div key={i} onClick={() => setDemoStep(i)} style={{
                  width: i === demoStep ? 28 : 8, height: 8, borderRadius: 4,
                  background: i === demoStep ? DEMO_STEPS[i].color : "var(--surface2)",
                  cursor: "pointer", transition: "all 0.3s ease",
                }} />
              ))}
            </div>

            {/* Step content */}
            <div style={{ padding: "28px 36px 32px" }}>
              {DEMO_STEPS.map((s, i) => (
                <div key={i} style={{ display: i === demoStep ? "flex" : "none", gap: 24, alignItems: "flex-start", animation: "fadeUp 0.4s ease" }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 20, flexShrink: 0,
                    background: s.color + "20", border: `2px solid ${s.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 30, color: s.color,
                  }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: 1 }}>Step {s.step}</div>
                      <div style={{ flex: 1, height: 1, background: s.color + "30" }} />
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>{s.title}</div>
                    <div style={{ color: "var(--text2)", fontSize: 15, lineHeight: 1.7 }}>{s.desc}</div>
                  </div>
                </div>
              ))}

              {/* Nav buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
                <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setDemoStep((s) => Math.max(0, s - 1))} disabled={demoStep === 0}>← Previous</button>
                <span style={{ fontSize: 13, color: "var(--text3)" }}>{demoStep + 1} / {DEMO_STEPS.length}</span>
                {demoStep < DEMO_STEPS.length - 1
                  ? <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => setDemoStep((s) => s + 1)}>Next →</button>
                  : <button className="btn btn-green" style={{ fontSize: 13 }} onClick={() => { setShowDemo(false); navigate("templates"); }}>Start Building →</button>
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div className="glow-circle animate-float" style={{ width: 600, height: 600, background: "rgba(108,99,255,0.12)", top: "10%", left: "-10%", transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`, transition: "transform 0.1s ease" }} />
        <div className="glow-circle" style={{ width: 400, height: 400, background: "rgba(0,229,160,0.08)", bottom: "10%", right: "-5%", animation: "float 8s ease-in-out infinite 2s", transform: `translate(${mousePos.x * -0.2}px, ${mousePos.y * -0.2}px)`, transition: "transform 0.1s ease" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 40px 80px", position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
            <div style={{ flex: 1 }}>
              <div className="badge badge-purple animate-fade-up delay-1" style={{ marginBottom: 24 }}>✦ AI-Powered Resume Builder</div>
              <h1 className="animate-fade-up delay-2" style={{ fontSize: "clamp(40px, 5vw, 72px)", marginBottom: 16, letterSpacing: "-1px" }}>
                Build Your Perfect<br />
                <span className="gradient-text">{displayText}</span>
                <span style={{ display: "inline-block", width: 3, height: "0.85em", background: "var(--accent)", marginLeft: 4, animation: "blink 1s step-end infinite", verticalAlign: "text-bottom" }} />
              </h1>
              <p className="animate-fade-up delay-3" style={{ fontSize: 18, color: "var(--text2)", marginBottom: 40, maxWidth: 520, lineHeight: 1.7 }}>
                AI predicts your selection chances, tailors your resume to every job description, and gives actionable feedback to land more interviews.
              </p>
              <div className="animate-fade-up delay-4" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
                <button className="btn btn-primary" onClick={() => navigate("templates")} style={{ fontSize: 16, padding: "14px 32px" }}>Start Building Free →</button>
                <button className="btn btn-ghost" style={{ fontSize: 15 }} onClick={() => setShowDemo(true)}>▶ Watch Demo</button>
              </div>
              <div className="animate-fade-up delay-5" style={{ display: "flex", gap: 32 }}>
                {STATS.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-scale-in delay-4" style={{ flex: "0 0 420px", transform: `perspective(1000px) rotateY(${mousePos.x * 0.02}deg) rotateX(${mousePos.y * -0.02}deg)`, transition: "transform 0.1s ease" }}>
              <ResumePreviewCard />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="badge badge-green" style={{ marginBottom: 16 }}>Features</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 16 }}>Everything you need to <span className="gradient-text">land the job</span></h2>
          <p style={{ color: "var(--text2)", fontSize: 17, maxWidth: 500, margin: "0 auto" }}>From AI-tailored content to real-time selection prediction — all in one place.</p>
        </div>
        <div className="grid-3" style={{ gap: 20 }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} delay={i * 0.1} />)}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "80px 40px", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="badge badge-amber" style={{ marginBottom: 16 }}>Process</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>Ready in <span className="gradient-text">5 steps</span></h2>
          </div>
          <div style={{ display: "flex", gap: 0, position: "relative" }}>
            <div style={{ position: "absolute", top: 40, left: "10%", right: "10%", height: 2, background: "linear-gradient(90deg, var(--accent), var(--green))", opacity: 0.3 }} />
            {["Choose Template", "Fill Your Info", "Customize Look", "AI Score & JD", "Download PDF"].map((step, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", padding: "0 12px" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px", background: `linear-gradient(135deg, ${["#6c63ff","#00e5a0","#f59e0b","#ec4899","#8b5cf6"][i]}20, ${["#6c63ff","#00e5a0","#f59e0b","#ec4899","#8b5cf6"][i]}40)`, border: `2px solid ${["#6c63ff","#00e5a0","#f59e0b","#ec4899","#8b5cf6"][i]}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontFamily: "var(--font-display)", fontWeight: 800, color: ["#6c63ff","#00e5a0","#f59e0b","#ec4899","#8b5cf6"][i], position: "relative", zIndex: 1 }}>{i + 1}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{step}</div>
                <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>{["10+ industry templates", "Smart adaptive form", "Font, color, layout", "ML score + keywords", "Direct PDF download"][i]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="glow-circle" style={{ width: 500, height: 500, background: "rgba(108,99,255,0.1)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 64px)", marginBottom: 20 }}>Your dream job is<br /><span className="gradient-text">one resume away</span></h2>
          <p style={{ color: "var(--text2)", fontSize: 18, marginBottom: 40 }}>Join 50,000+ professionals who landed jobs with SmartResume AI</p>
          <button className="btn btn-primary animate-pulse-glow" onClick={() => navigate("templates")} style={{ fontSize: 17, padding: "16px 40px" }}>Build Your Resume Now — It's Free →</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text3)", fontSize: 13, maxWidth: 1200, margin: "0 auto" }}>
        <div className="nav-logo" style={{ fontSize: 16 }}>SmartResume AI</div>
        <div>© 2025 SmartResume AI — Built by Sahil Dorugade</div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {["Privacy", "Terms", "Contact"].map((l) => (
            <span key={l} style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={(e) => (e.target.style.color = "var(--text)")} onMouseOut={(e) => (e.target.style.color = "var(--text3)")}>{l}</span>
          ))}
          <span
            onClick={() => navigate("admin")}
            title="Admin"
            style={{ cursor: "pointer", opacity: 0.15, fontSize: 11, transition: "opacity 0.3s", userSelect: "none" }}
            onMouseOver={(e) => (e.target.style.opacity = "1")}
            onMouseOut={(e) => (e.target.style.opacity = "0.15")}
          >⚙ Admin</span>
        </div>
      </footer>
    </div>
  );
}

function ResumePreviewCard() {
  const [score, setScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let c = 0;
      const iv = setInterval(() => {
        c += 2;
        if (c >= 96) { clearInterval(iv); setScore(96); } else setScore(c);
      }, 25);
      return () => clearInterval(iv);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)" }}>
      <div style={{ background: "var(--gradient)", padding: "20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 70% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Sahil Dorugade</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Data Scientist</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>AI Match Score</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28 }}>{score}%</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>Skills Match</div>
          {[
            { skill: "Python / ML", match: 98, color: "#00e5a0" },
            { skill: "TensorFlow / PyTorch", match: 94, color: "#6c63ff" },
            { skill: "SQL / Data Analysis", match: 90, color: "#f59e0b" },
            { skill: "CGPA: 9.60", match: 96, color: "#ec4899" },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--text2)" }}>{s.skill}</span>
                <span style={{ color: s.color, fontWeight: 600 }}>{s.match}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ "--target-width": `${s.match}%`, background: `linear-gradient(90deg, ${s.color}80, ${s.color})`, animationDelay: `${i * 0.2}s` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--bg3)", borderRadius: 12, padding: 16, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>AI Suggestions</div>
          {[
            { text: "Add MLflow / experiment tracking", impact: "+6%" },
            { text: "Quantify model accuracy metrics", impact: "+5%" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i === 0 ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontSize: 12, color: "var(--text2)" }}>▸ {s.text}</span>
              <span className="badge badge-green" style={{ fontSize: 11, padding: "2px 8px" }}>{s.impact}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16, fontSize: 14 }}>View Full Analysis →</button>
      </div>
    </div>
  );
}

function FeatureCard({ feature, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, cursor: "default", transition: `all 0.4s cubic-bezier(0.22,1,0.36,1) ${delay}s`, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)" }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = feature.color + "40"; e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${feature.color}15`; e.currentTarget.style.transform = "translateY(-6px)"; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: feature.color + "20", border: `1px solid ${feature.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: feature.color, marginBottom: 18 }}>{feature.icon}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{feature.title}</div>
      <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>{feature.desc}</div>
    </div>
  );
}
