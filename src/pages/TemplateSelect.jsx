import { useState } from "react";

const TEMPLATES = [
  {
    id: "fresher",
    name: "Fresher Pro",
    tag: "Best for Students",
    tagColor: "#6c63ff",
    desc: "Perfect for fresh graduates. Highlights education, projects, internships, skills and achievements.",
    fields: ["education", "skills", "projects", "internships", "certifications", "achievements"],
    preview: { accent: "#6c63ff", layout: "single", sections: ["Education", "Skills", "Projects", "Internships"] },
    category: "student",
  },
  {
    id: "experienced",
    name: "Executive Edge",
    tag: "Most Popular",
    tagColor: "#00e5a0",
    desc: "Bold, results-driven for professionals with 2+ years. Focuses on impact and measurable achievements.",
    fields: ["experience", "skills", "education", "projects", "certifications", "achievements"],
    preview: { accent: "#00e5a0", layout: "double", sections: ["Experience", "Skills", "Education", "Certs"] },
    category: "experienced",
  },
  {
    id: "tech",
    name: "Tech Architect",
    tag: "For Engineers",
    tagColor: "#f59e0b",
    desc: "Structured for developers and engineers. Emphasis on tech stack, GitHub, open source and projects.",
    fields: ["skills", "experience", "projects", "education", "certifications", "achievements"],
    preview: { accent: "#f59e0b", layout: "single", sections: ["Skills", "Experience", "Projects", "Education"] },
    category: "tech",
  },
  {
    id: "ml",
    name: "AI/ML Specialist",
    tag: "For Data Scientists",
    tagColor: "#8b5cf6",
    desc: "Showcase models, datasets, publications and research. Built for AI/ML/Data Science roles.",
    fields: ["skills", "experience", "projects", "certifications", "education", "achievements"],
    preview: { accent: "#8b5cf6", layout: "double", sections: ["Research", "Projects", "Skills", "Publications"] },
    category: "tech",
  },
  {
    id: "ats",
    name: "ATS Stealth",
    tag: "ATS Optimized",
    tagColor: "#06b6d4",
    desc: "Maximally ATS-compatible. Clean plain structure that passes all resume scanners effortlessly.",
    fields: ["experience", "education", "skills", "certifications", "projects", "achievements"],
    preview: { accent: "#06b6d4", layout: "single", sections: ["Summary", "Experience", "Skills", "Education"] },
    category: "ats",
  },
  {
    id: "finance",
    name: "Finance Pro",
    tag: "For Finance Roles",
    tagColor: "#10b981",
    desc: "Tailored for banking, investment, accounting and financial analyst roles. Numbers-forward layout.",
    fields: ["experience", "education", "skills", "certifications", "projects", "achievements"],
    preview: { accent: "#10b981", layout: "single", sections: ["Experience", "Education", "Skills", "Certs"] },
    category: "finance",
  },
  {
    id: "marketing",
    name: "Marketing Maven",
    tag: "For Marketing",
    tagColor: "#f97316",
    desc: "Campaign-focused layout for digital marketers, brand managers, content creators and growth hackers.",
    fields: ["experience", "skills", "projects", "education", "certifications", "achievements"],
    preview: { accent: "#f97316", layout: "sidebar", sections: ["Campaigns", "Skills", "Experience", "Results"] },
    category: "marketing",
  },
  {
    id: "designer",
    name: "Creative Canvas",
    tag: "For Creatives",
    tagColor: "#ec4899",
    desc: "Visually rich for designers, UI/UX professionals, illustrators and creative directors.",
    fields: ["skills", "experience", "education", "projects", "certifications", "achievements"],
    preview: { accent: "#ec4899", layout: "sidebar", sections: ["Portfolio", "Skills", "Tools", "Experience"] },
    category: "creative",
  },
  {
    id: "hr",
    name: "HR Champion",
    tag: "For HR & People",
    tagColor: "#a855f7",
    desc: "People-first layout for HR managers, talent acquisition, L&D and organizational development roles.",
    fields: ["experience", "skills", "education", "certifications", "projects", "achievements"],
    preview: { accent: "#a855f7", layout: "double", sections: ["Experience", "Skills", "Education", "Certs"] },
    category: "hr",
  },
  {
    id: "management",
    name: "Leadership Suite",
    tag: "For Managers",
    tagColor: "#ef4444",
    desc: "Executive layout for product managers, business analysts, team leads and C-suite professionals.",
    fields: ["experience", "skills", "education", "projects", "certifications", "achievements"],
    preview: { accent: "#ef4444", layout: "double", sections: ["Leadership", "Experience", "Skills", "Education"] },
    category: "experienced",
  },
  {
    id: "ats_fresher",
    name: "ATS Fresher Pro",
    tag: "🎯 ATS Optimized",
    tagColor: "#00e5a0",
    desc: "Single-column, keyword-dense layout built to pass Applicant Tracking Systems. Zero tables, zero graphics — 100% ATS-safe for freshers.",
    fields: ["personal", "education", "skills", "projects", "internships", "certifications"],
    preview: { accent: "#00e5a0", layout: "single", sections: ["Personal", "Education", "Skills", "Projects"] },
    category: "ats",
  },
  {
    id: "ats_experienced",
    name: "ATS Executive",
    tag: "ATS Friendly",
    tagColor: "#06b6d4",
    desc: "Clean single-column ATS-safe format for professionals. Reverse-chronological experience, keyword-optimized skills section.",
    fields: ["personal", "experience", "skills", "education", "certifications", "achievements"],
    preview: { accent: "#06b6d4", layout: "single", sections: ["Experience", "Skills", "Education", "Certs"] },
    category: "ats",
  },
  {
    id: "finance_analyst",
    name: "Finance Analyst",
    tag: "For Finance",
    tagColor: "#f59e0b",
    desc: "Structured for finance roles — accounting, investment banking, financial analysis. Highlights modeling skills and certifications.",
    fields: ["personal", "experience", "skills", "education", "certifications", "achievements"],
    preview: { accent: "#f59e0b", layout: "double", sections: ["Experience", "Skills", "Education", "Certs"] },
    category: "finance",
  },
  {
    id: "marketing_pro",
    name: "Growth Marketer",
    tag: "For Marketing",
    tagColor: "#ec4899",
    desc: "Built for digital marketers, SEO specialists and brand managers. Highlights campaigns, metrics and tools.",
    fields: ["personal", "experience", "skills", "projects", "certifications", "achievements"],
    preview: { accent: "#ec4899", layout: "double", sections: ["Campaigns", "Skills", "Experience", "Results"] },
    category: "marketing",
  },
  {
    id: "academic",
    name: "Research Scholar",
    tag: "Academic",
    tagColor: "#8b5cf6",
    desc: "Ideal for PhD, research, and academic positions. Sections for publications, research, teaching, and academic awards.",
    fields: ["personal", "education", "experience", "skills", "certifications", "achievements"],
    preview: { accent: "#8b5cf6", layout: "single", sections: ["Education", "Research", "Publications", "Awards"] },
    category: "student",
  },
  {
    id: "internship",
    name: "Internship Ready",
    tag: "For Interns",
    tagColor: "#10b981",
    desc: "Compact 1-page format perfect for students applying for internships. Highlights coursework, projects and skills.",
    fields: ["personal", "education", "skills", "projects", "internships", "achievements"],
    preview: { accent: "#10b981", layout: "single", sections: ["Education", "Projects", "Skills", "Achievements"] },
    category: "student",
  },
];

const FILTERS = [
  { id: "all", label: "All Templates" },
  { id: "student", label: "Student / Fresher" },
  { id: "tech", label: "Tech / Engineering" },
  { id: "finance", label: "Finance" },
  { id: "marketing", label: "Marketing" },
  { id: "creative", label: "Creative" },
  { id: "hr", label: "HR & People" },
  { id: "experienced", label: "Experienced" },
  { id: "ats", label: "ATS Optimized" },
];

const DOMAINS = [
  { id: "tech", label: "💻 Tech", desc: "Programming, Cloud, DevOps" },
  { id: "finance", label: "📊 Finance", desc: "Accounting, Excel, CFA" },
  { id: "hr", label: "👥 HR", desc: "Recruitment, Payroll, HRIS" },
  { id: "marketing", label: "📣 Marketing", desc: "SEO, Social Media, Branding" },
];

export default function TemplateSelect({ navigate, selectedDomain = "tech", setSelectedDomain }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [domain, setDomain] = useState(selectedDomain);

  const handleDomain = (d) => { setDomain(d); if (setSelectedDomain) setSelectedDomain(d); };

  const visible = filter === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 80 }}>
      <nav className="nav">
        <div className="nav-logo" onClick={() => navigate("landing")} style={{ cursor: "pointer" }}>SmartResume AI</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "var(--text3)", fontSize: 13 }}>Step 1 of 3</span>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ width: 32, height: 4, borderRadius: 2, background: s === 1 ? "var(--gradient)" : "var(--surface2)" }} />
            ))}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "60px 40px" }}>
        {/* Header */}
        <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="badge badge-purple" style={{ marginBottom: 16 }}>Step 1</div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 52px)", marginBottom: 14 }}>
            Choose your <span className="gradient-text">template</span>
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 17 }}>10+ industry-specific templates — each AI-optimized for its target role</p>
        </div>

        {/* Domain selector */}
        <div className="animate-fade-up delay-1" style={{ marginBottom: 28, textAlign: "center" }}>
          <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 12, fontWeight: 500 }}>Select your domain</p>
          <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {DOMAINS.map(d => (
              <button key={d.id} onClick={() => handleDomain(d.id)} style={{
                padding: "10px 20px", borderRadius: 14, border: `2px solid ${domain === d.id ? "var(--accent)" : "var(--border)"}`,
                background: domain === d.id ? "rgba(108,99,255,0.12)" : "var(--surface)",
                color: domain === d.id ? "var(--accent)" : "var(--text2)",
                cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-body)",
                transition: "all 0.2s",
              }}>
                <div>{d.label}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Filter tabs — scrollable */}
        <div className="animate-fade-up delay-1" style={{ display: "flex", justifyContent: "center", marginBottom: 36, overflowX: "auto", paddingBottom: 8 }}>
          <div style={{ display: "flex", gap: 8, background: "var(--surface)", borderRadius: 50, padding: 6, flexShrink: 0 }}>
            {FILTERS.map((f) => (
              <button key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: "8px 18px", borderRadius: 50, border: "none",
                  background: filter === f.id ? "var(--gradient)" : "transparent",
                  color: filter === f.id ? "#fff" : "var(--text2)",
                  cursor: "pointer", fontSize: 13, fontWeight: 500,
                  fontFamily: "var(--font-body)", whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  boxShadow: filter === f.id ? "0 2px 10px var(--accent-glow)" : "none",
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="animate-fade-up delay-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {visible.map((tpl, i) => (
            <TemplateCard key={tpl.id} template={tpl} selected={selected?.id === tpl.id} onSelect={() => setSelected(tpl)} delay={i * 0.04} />
          ))}
        </div>

        {/* Bottom action */}
        <div className="animate-fade-up delay-3" style={{ display: "flex", justifyContent: "center", marginTop: 50, gap: 16, alignItems: "center" }}>
          <button className="btn btn-ghost" onClick={() => navigate("landing")}>← Back</button>
          <button
            className="btn btn-primary"
            style={{ fontSize: 16, padding: "14px 36px", opacity: selected ? 1 : 0.4, pointerEvents: selected ? "auto" : "none" }}
            onClick={() => selected && navigate("builder", { template: selected, domain })}
          >
            Continue with {selected ? `"${selected.name}"` : "a template"} →
          </button>
        </div>

        {!selected && (
          <p style={{ textAlign: "center", color: "var(--text3)", fontSize: 13, marginTop: 12 }}>Select a template above to continue</p>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ template, selected, onSelect, delay }) {
  return (
    <div onClick={onSelect} style={{
      background: selected ? `${template.preview.accent}10` : "var(--surface)",
      border: `2px solid ${selected ? template.preview.accent : "var(--border)"}`,
      borderRadius: 20, cursor: "pointer", overflow: "hidden",
      transition: `all 0.3s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      transform: selected ? "scale(1.02)" : "scale(1)",
      boxShadow: selected ? `0 20px 40px ${template.preview.accent}25` : "none",
    }}
      onMouseOver={(e) => { if (!selected) e.currentTarget.style.borderColor = template.preview.accent + "60"; e.currentTarget.style.transform = selected ? "scale(1.02)" : "scale(1.01)"; }}
      onMouseOut={(e) => { if (!selected) e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = selected ? "scale(1.02)" : "scale(1)"; }}
    >
      {/* Preview mock */}
      <div style={{ height: 160, background: "var(--bg)", position: "relative", overflow: "hidden" }}>
        <ResumeMock template={template} />
        {selected && (
          <div style={{ position: "absolute", top: 10, right: 10, background: template.preview.accent, color: "#000", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>✓</div>
        )}
      </div>

      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{template.name}</div>
          <div style={{ fontSize: 10, padding: "3px 10px", borderRadius: 50, background: template.tagColor + "20", color: template.tagColor, border: `1px solid ${template.tagColor}30`, whiteSpace: "nowrap", marginLeft: 8 }}>{template.tag}</div>
        </div>
        <p style={{ color: "var(--text2)", fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>{template.desc}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {template.fields.slice(0, 4).map((f) => (
            <span key={f} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50, background: "var(--surface2)", color: "var(--text3)", textTransform: "capitalize" }}>{f.replace("_", " ")}</span>
          ))}
          {template.fields.length > 4 && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50, background: "var(--surface2)", color: "var(--text3)" }}>+{template.fields.length - 4}</span>}
        </div>
      </div>
    </div>
  );
}

function ResumeMock({ template }) {
  const { accent, layout } = template.preview;
  const isSidebar = layout === "sidebar";
  const isDouble = layout === "double";

  return (
    <div style={{ padding: 14, height: "100%", display: "flex", gap: 8 }}>
      {isSidebar && (
        <div style={{ width: 55, background: accent + "25", borderRadius: 6, padding: 6, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: accent + "70", margin: "0 auto 4px" }} />
          {[70, 90, 55, 80, 65].map((w, i) => <div key={i} style={{ height: 3, borderRadius: 2, background: accent + "80", width: `${w}%` }} />)}
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ height: 7, borderRadius: 2, background: accent, width: "60%" }} />
        <div style={{ height: 3, borderRadius: 2, background: accent + "50", width: "40%" }} />
        <div style={{ height: 1, background: "var(--border)", margin: "3px 0" }} />
        {[0, 1, 2].map((sec) => (
          <div key={sec}>
            <div style={{ height: 3, borderRadius: 2, background: accent, width: "30%", marginBottom: 4, opacity: 0.8 }} />
            {[80, 65, 90].slice(0, sec === 0 ? 3 : 2).map((w, j) => (
              <div key={j} style={{ height: 2.5, borderRadius: 2, background: "var(--surface2)", width: `${w}%`, marginBottom: 2.5 }} />
            ))}
          </div>
        ))}
      </div>
      {isDouble && (
        <div style={{ width: 60, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ height: 3, borderRadius: 2, background: accent, width: "70%", opacity: 0.8 }} />
          {[85, 70, 90, 60, 75, 55].map((v, i) => (
            <div key={i} style={{ height: 3, borderRadius: 2, background: accent + "30", width: "100%", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${v}%`, background: accent }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
