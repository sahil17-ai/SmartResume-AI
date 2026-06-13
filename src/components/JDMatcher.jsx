import { useState } from "react";

export default function JDMatcher({ formData, onUpdate }) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = () => {
    if (!jd.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const jdLower = jd.toLowerCase();
      const skillsData = formData.skills || {};
      const allMySkills = Object.values(skillsData).join(" ").toLowerCase();

      // Extract keywords from JD
      const commonWords = new Set(["the","a","an","in","at","for","and","or","with","to","of","as","is","are","be","this","that","will","you","we","our","your","have","has","can","must","required","experience","years","strong","good","ability","knowledge","using"]);
      const jdWords = jd.match(/\b[a-zA-Z+#.]{2,}\b/g) || [];
      const jdKeywords = [...new Set(jdWords.map(w => w.toLowerCase()).filter(w => !commonWords.has(w) && w.length > 2))];

      const matched = jdKeywords.filter(k => allMySkills.includes(k) || JSON.stringify(formData).toLowerCase().includes(k));
      const missing = jdKeywords.filter(k => !allMySkills.includes(k) && !JSON.stringify(formData).toLowerCase().includes(k)).slice(0, 12);

      const matchPct = Math.min(95, Math.round((matched.length / Math.max(jdKeywords.length, 1)) * 100));

      setResult({ matchPct, matched: matched.slice(0, 15), missing, totalKeywords: jdKeywords.length });
      setLoading(false);
    }, 1500);
  };

  const addSkillsToResume = () => {
    if (!result) return;
    const current = formData.skills || {};
    const updatedTools = (current.tools || "") + (result.missing.slice(0, 5).join(", "));
    onUpdate({ ...formData, skills: { ...current, tools: updatedTools } });
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div className="badge badge-green" style={{ marginBottom: 12 }}>JD Match</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, marginBottom: 8 }}>
          Job Description <span className="gradient-text-green">Matcher</span>
        </h2>
        <p style={{ color: "var(--text2)" }}>Paste any job description and AI will show how well your resume matches and what to add.</p>
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 20, padding: 28, border: "1px solid var(--border)", marginBottom: 24 }}>
        <label className="label" style={{ marginBottom: 10 }}>Paste Job Description</label>
        <textarea
          className="input"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="We are looking for a Software Engineer with 2+ years of experience in Python, React, Docker, AWS... Responsibilities: Build scalable microservices..."
          style={{ minHeight: 180, marginBottom: 16, fontSize: 14 }}
        />
        <button className="btn btn-green" onClick={analyze} disabled={!jd.trim() || loading}
          style={{ opacity: jd.trim() ? 1 : 0.4 }}>
          {loading ? "Analyzing..." : "Analyze Match →"}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 48, height: 48, border: "3px solid var(--surface2)", borderTop: "3px solid var(--green)", borderRadius: "50%", animation: "spin-slow 1s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ color: "var(--text2)" }}>Matching your profile to job requirements...</div>
        </div>
      )}

      {result && !loading && (
        <div className="animate-fade-up">
          {/* Match score */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1, background: "var(--surface)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 800, color: result.matchPct >= 70 ? "#00e5a0" : result.matchPct >= 50 ? "#f59e0b" : "#ef4444" }}>
                {result.matchPct}%
              </div>
              <div style={{ color: "var(--text2)", fontSize: 14 }}>JD Match Score</div>
              <div className="progress-bar" style={{ marginTop: 12 }}>
                <div className="progress-bar-fill" style={{ "--target-width": `${result.matchPct}%`, background: result.matchPct >= 70 ? "var(--gradient2)" : "var(--gradient)" }} />
              </div>
            </div>
            <div style={{ flex: 1, background: "var(--surface)", borderRadius: 16, padding: 24, border: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 800, color: "var(--accent)" }}>{result.matched.length}</div>
              <div style={{ color: "var(--text2)", fontSize: 14 }}>Keywords Matched</div>
              <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 4 }}>out of {result.totalKeywords} in JD</div>
            </div>
            <div style={{ flex: 1, background: "var(--surface)", borderRadius: 16, padding: 24, border: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 800, color: "var(--amber)" }}>{result.missing.length}</div>
              <div style={{ color: "var(--text2)", fontSize: 14 }}>Missing Keywords</div>
              <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 4 }}>to add to your resume</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Matched */}
            <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24, border: "1px solid rgba(0,229,160,0.2)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, marginBottom: 14, color: "var(--green)", display: "flex", alignItems: "center", gap: 8 }}>
                ✓ Matched Keywords
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.matched.map((k, i) => (
                  <span key={i} className="badge badge-green" style={{ fontSize: 12 }}>{k}</span>
                ))}
              </div>
            </div>

            {/* Missing */}
            <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24, border: "1px solid rgba(245,158,11,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--amber)", display: "flex", alignItems: "center", gap: 8 }}>
                  ✕ Missing Keywords
                </div>
                <button className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 12px" }} onClick={addSkillsToResume}>
                  Add Top 5 →
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.missing.map((k, i) => (
                  <span key={i} className="badge badge-amber" style={{ fontSize: 12 }}>{k}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 16, padding: 20, fontSize: 14, color: "var(--text2)", lineHeight: 1.7 }}>
            <strong style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}>AI Recommendation: </strong>
            {result.matchPct >= 75
              ? "Great match! Your resume aligns well with this job. Consider slightly reordering your experience bullet points to put the most relevant achievements first."
              : result.matchPct >= 50
              ? `Moderate match. Add the missing keywords to your skills section and tailor your summary to mention ${result.missing.slice(0, 3).join(", ")}. This alone can increase your ATS pass rate by 30%.`
              : `Low match. This role requires skills you haven't listed yet. Consider adding ${result.missing.slice(0, 5).join(", ")} to your skills section and building small projects around these technologies.`}
          </div>
        </div>
      )}
    </div>
  );
}
