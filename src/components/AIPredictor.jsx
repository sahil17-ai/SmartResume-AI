import { useState, useEffect } from "react";
import API from "../config";
const SKILL_KEYWORDS = {
  high_demand: ["python", "react", "node", "docker", "kubernetes", "aws", "tensorflow", "pytorch", "sql", "postgresql", "mongodb", "redis", "golang", "typescript", "graphql", "fastapi"],
  medium_demand: ["javascript", "java", "c++", "django", "flask", "mysql", "git", "linux", "rest api", "microservices"],
  certifications: ["aws certified", "google cloud", "azure", "tensorflow developer", "deep learning", "coursera", "udemy"],
};

function computeScore(formData) {
  const scores = { skills: 0, projects: 0, education: 0, experience: 0, completeness: 0, format: 0 };
  const suggestions = [];
  let breakdown = [];

  // Skills score
  const skillsData = formData.skills || {};
  const allSkills = Object.values(skillsData).join(" ").toLowerCase();
  const highMatches = SKILL_KEYWORDS.high_demand.filter((k) => allSkills.includes(k));
  const medMatches = SKILL_KEYWORDS.medium_demand.filter((k) => allSkills.includes(k));
  scores.skills = Math.min(100, highMatches.length * 8 + medMatches.length * 4);
  breakdown.push({ label: "Skills", score: scores.skills, max: 100, color: "#6c63ff", detail: `${highMatches.length} high-demand + ${medMatches.length} medium skills` });

  if (highMatches.length < 5) suggestions.push({ text: `Add high-demand skills: ${SKILL_KEYWORDS.high_demand.slice(0, 4).join(", ")}`, impact: "+15%", priority: "high" });
  if (!allSkills.includes("docker")) suggestions.push({ text: "Add Docker & containerization", impact: "+8%", priority: "high" });
  if (!allSkills.includes("aws") && !allSkills.includes("gcp") && !allSkills.includes("azure")) suggestions.push({ text: "Add cloud platform (AWS/GCP/Azure)", impact: "+10%", priority: "medium" });

  // Projects score
  const projects = Array.isArray(formData.projects) ? formData.projects : [];
  scores.projects = Math.min(100, projects.length * 22 + (projects.filter((p) => p.link).length * 8));
  breakdown.push({ label: "Projects", score: scores.projects, max: 100, color: "#00e5a0", detail: `${projects.length} projects, ${projects.filter((p) => p.link).length} with links` });
  if (projects.length < 3) suggestions.push({ text: `Add ${3 - projects.length} more projects with GitHub links`, impact: "+12%", priority: "high" });
  if (projects.some((p) => !p.link)) suggestions.push({ text: "Add GitHub/live links to all projects", impact: "+8%", priority: "medium" });

  // Education
  const edu = Array.isArray(formData.education) ? formData.education : [];
  const cgpaStr = edu[0]?.cgpa || "";
  const cgpa = parseFloat(cgpaStr.match(/[\d.]+/)?.[0] || "0");
  scores.education = cgpa >= 9 ? 95 : cgpa >= 8 ? 80 : cgpa >= 7 ? 65 : cgpa >= 6 ? 45 : edu.length > 0 ? 30 : 0;
  breakdown.push({ label: "Education", score: scores.education, max: 100, color: "#f59e0b", detail: cgpa ? `CGPA: ${cgpa}` : "Not filled" });
  if (cgpa < 7 && cgpa > 0) suggestions.push({ text: "Highlight relevant coursework & certifications to offset GPA", impact: "+5%", priority: "low" });

  // Experience
  const exp = Array.isArray(formData.experience) ? formData.experience : [];
  scores.experience = Math.min(100, exp.length * 30 + (exp.filter((e) => e.description?.length > 100).length * 10));
  breakdown.push({ label: "Experience", score: scores.experience, max: 100, color: "#ec4899", detail: `${exp.length} positions` });
  if (exp.length === 0) suggestions.push({ text: "Add internship or work experience", impact: "+20%", priority: "high" });
  if (exp.some((e) => !e.description || e.description.length < 100)) suggestions.push({ text: "Add quantified achievements to each experience (numbers, %)", impact: "+12%", priority: "high" });

  // Completeness
  const personal = formData.personal || {};
  const completedPersonal = ["name", "email", "phone", "summary", "linkedin", "github"].filter((k) => personal[k]).length;
  scores.completeness = Math.round((completedPersonal / 6) * 100);
  breakdown.push({ label: "Profile Completeness", score: scores.completeness, max: 100, color: "#06b6d4", detail: `${completedPersonal}/6 fields filled` });
  if (!personal.linkedin) suggestions.push({ text: "Add LinkedIn profile URL", impact: "+5%", priority: "medium" });
  if (!personal.github) suggestions.push({ text: "Add GitHub profile URL", impact: "+5%", priority: "medium" });
  if (!personal.summary || personal.summary.length < 100) suggestions.push({ text: "Write a compelling 3-4 sentence professional summary", impact: "+7%", priority: "medium" });

  // Certifications
  const certs = Array.isArray(formData.certifications) ? formData.certifications : [];
  scores.format = Math.min(100, certs.length * 25 + 20);
  breakdown.push({ label: "Certifications", score: scores.format, max: 100, color: "#8b5cf6", detail: `${certs.length} certifications` });
  if (certs.length === 0) suggestions.push({ text: "Add certifications (AWS, Google, Coursera courses)", impact: "+10%", priority: "medium" });

  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);
  return { overall, breakdown, suggestions: suggestions.slice(0, 6), scores };
}

export default function AIPredictor({ formData, template, domain = "tech" }) {
  const [result, setResult] = useState(null);
  const [animScore, setAnimScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const LOADING_STEPS = [
    "Scanning skills database...",
    "Analyzing project quality...",
    "Running ML prediction model...",
    "Computing final AI score...",
  ];

  const analyze = async () => {
    setLoading(true);
    setAnalyzed(false);
    setLoadingStep(0);

    // Cycle loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 600);

    try {
      const res = await fetch(`${API}/api/predict/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_data: { ...formData, domain } }),
      });

      clearInterval(stepInterval);

      if (res.ok) {
        const data = await res.json();
        // Normalise to frontend shape
        const r = {
          overall: data.overall_score,
          breakdown: data.breakdown.map(b => ({ ...b, max: 100 })),
          suggestions: data.suggestions,
          grade: data.grade,
          interpretation: data.interpretation,
          ml_score: data.ml_score,
          selection_probability: data.selection_probability,
        };
        setResult(r);
        let current = 0;
        const interval = setInterval(() => {
          current += 2;
          if (current >= r.overall) { clearInterval(interval); setAnimScore(r.overall); }
          else setAnimScore(current);
        }, 20);
      } else {
        // Fallback to local computation
        const r = computeScore(formData);
        setResult(r);
        setAnimScore(r.overall);
      }
    } catch {
      clearInterval(stepInterval);
      const r = computeScore(formData);
      setResult(r);
      setAnimScore(r.overall);
    } finally {
      setLoading(false);
      setAnalyzed(true);
    }
  };

  const scoreColor = (s) => s >= 80 ? "#00e5a0" : s >= 60 ? "#f59e0b" : s >= 40 ? "#6c63ff" : "#ef4444";
  const scoreLabel = (s) => s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Average" : "Needs Work";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div className="badge badge-purple" style={{ marginBottom: 12 }}>AI Analysis</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, marginBottom: 8 }}>
          Selection <span className="gradient-text">Predictor</span>
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 16 }}>
          Our ML model analyzes your resume across 6 dimensions and predicts your selection probability.
        </p>
      </div>

      {!analyzed && !loading && (
        <div style={{ textAlign: "center", padding: "60px 40px", background: "var(--surface)", borderRadius: 24, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>◎</div>
          <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 12 }}>Ready to analyze your resume?</h3>
          <p style={{ color: "var(--text2)", marginBottom: 28 }}>Fill in your details first, then click analyze to get your AI score and personalized suggestions.</p>
          <button className="btn btn-primary animate-pulse-glow" onClick={analyze} style={{ fontSize: 16, padding: "14px 36px" }}>
            Analyze My Resume →
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "80px 40px" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid var(--surface2)", borderTop: "3px solid var(--accent)", animation: "spin-slow 1s linear infinite", margin: "0 auto 24px" }} />
          <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Analyzing Resume...</h3>
          <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 20 }}>Our ML model is scoring your profile across 6 dimensions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 300, margin: "0 auto" }}>
            {LOADING_STEPS.map((t, i) => (
              <div key={i} style={{
                fontSize: 13, display: "flex", alignItems: "center", gap: 10,
                color: i <= loadingStep ? "var(--text)" : "var(--text3)",
                transition: "color 0.3s",
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                  background: i < loadingStep ? "var(--green)" : i === loadingStep ? "var(--accent)" : "var(--surface2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
                  transition: "background 0.3s",
                }}>
                  {i < loadingStep ? "✓" : i === loadingStep ? "•" : ""}
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {analyzed && result && (
        <div className="animate-fade-up">
          {/* Overall score */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 24, padding: 36, marginBottom: 24,
            display: "flex", gap: 40, alignItems: "center",
          }}>
            {/* Score circle */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--surface2)" strokeWidth="10" />
                <circle cx="80" cy="80" r="70" fill="none" stroke={scoreColor(animScore)} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - animScore / 100)}`}
                  transform="rotate(-90 80 80)"
                  style={{ transition: "stroke-dashoffset 0.05s linear" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: scoreColor(animScore) }}>{animScore}%</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>Match Score</div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>
                  {scoreLabel(result.overall)} Profile
                </h3>
                <div className="badge" style={{ background: scoreColor(result.overall) + "20", color: scoreColor(result.overall), border: `1px solid ${scoreColor(result.overall)}30` }}>
                  {result.overall >= 70 ? "Strong Candidate" : result.overall >= 50 ? "Moderate Chances" : "Needs Improvement"}
                </div>
              </div>

              {/* Grade + ML cards */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                {result.grade && (
                  <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 20px", textAlign: "center", minWidth: 80 }}>
                    <div style={{ fontSize: 28, fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--amber)" }}>{result.grade}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>Grade</div>
                  </div>
                )}
                {result.selection_probability != null && (
                  <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 20px", textAlign: "center", minWidth: 100 }}>
                    <div style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--green)" }}>{result.selection_probability}%</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>ML Selection Prob.</div>
                  </div>
                )}
                {result.ml_score != null && (
                  <div style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text2)" }}>
                    <span style={{ color: "var(--accent)" }}>◎</span>
                    <span>70% rules + 30% ML<br /><span style={{ color: "var(--text3)", fontSize: 11 }}>Hybrid scoring active</span></span>
                  </div>
                )}
              </div>

              <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                {result.interpretation || (result.overall >= 75
                  ? "Your resume is strong! A few targeted improvements could push you into the top 10% of applicants."
                  : result.overall >= 55
                    ? "You have a solid foundation. Focus on the high-priority suggestions below."
                    : "Your resume needs work in key areas. Follow the AI suggestions below.")}
              </p>
              <button className="btn btn-primary" onClick={analyze} style={{ fontSize: 13 }}>
                Re-analyze
              </button>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {result.breakdown.map((item, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: item.color }}>{item.score}</div>
                </div>
                <div className="progress-bar" style={{ marginBottom: 8 }}>
                  <div className="progress-bar-fill" style={{ "--target-width": `${item.score}%`, background: `linear-gradient(90deg, ${item.color}80, ${item.color})`, animationDelay: `${i * 0.1}s` }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>{item.detail}</div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 20 }}>
              AI Suggestions <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text3)" }}>— Apply these to boost your score</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {result.suggestions.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 18px", borderRadius: 12,
                  background: s.priority === "high" ? "rgba(239,68,68,0.05)" : s.priority === "medium" ? "rgba(245,158,11,0.05)" : "rgba(108,99,255,0.05)",
                  border: `1px solid ${s.priority === "high" ? "rgba(239,68,68,0.15)" : s.priority === "medium" ? "rgba(245,158,11,0.15)" : "rgba(108,99,255,0.15)"}`,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.priority === "high" ? "var(--red)" : s.priority === "medium" ? "var(--amber)" : "var(--accent)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, color: "var(--text)" }}>▸ {s.text}</span>
                  <div className="badge badge-green" style={{ fontSize: 12, flexShrink: 0 }}>{s.impact}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.priority}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
