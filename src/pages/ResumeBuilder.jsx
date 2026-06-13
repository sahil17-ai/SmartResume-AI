import { useState, useEffect, useCallback } from "react";
import AIPredictor from "../components/AIPredictor";
import JDMatcher from "../components/JDMatcher";
import ResumePreview from "../components/ResumePreview";
import Customizer from "../components/Customizer";
import AISuite from "../components/AISuite";

const SECTION_CONFIGS = {
  personal: {
    label: "Personal Info", icon: "◎",
    fields: [
      { key: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
      { key: "title", label: "Professional Title", type: "text", placeholder: "Software Engineer" },
      { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
      { key: "phone", label: "Phone", type: "tel", placeholder: "+91 98765 43210" },
      { key: "location", label: "Location", type: "text", placeholder: "Pune, Maharashtra" },
      { key: "linkedin", label: "LinkedIn URL", type: "url", placeholder: "linkedin.com/in/your-name" },
      { key: "github", label: "GitHub URL", type: "url", placeholder: "github.com/your-name" },
      { key: "summary", label: "Professional Summary", type: "textarea", placeholder: "Write your strengths, experience, and career goals." },
    ],
  },
  education: {
    label: "Education", icon: "◈", repeatable: true, itemLabel: "Degree",
    fields: [
      { key: "degree", label: "Degree / Course", type: "text", placeholder: "B.Tech Computer Science" },
      { key: "college", label: "College / University", type: "text", placeholder: "Pune University" },
      { key: "year", label: "Graduation Year", type: "text", placeholder: "2025" },
      { key: "cgpa", label: "CGPA / Percentage", type: "text", placeholder: "8.5 CGPA / 85%" },
      { key: "relevant_courses", label: "Relevant Courses", type: "text", placeholder: "DSA, ML, DBMS, OS" },
    ],
  },
  experience: {
    label: "Work Experience", icon: "✦", repeatable: true, itemLabel: "Job",
    fields: [
      { key: "company", label: "Company Name", type: "text", placeholder: "Company name" },
      { key: "role", label: "Job Title", type: "text", placeholder: "Software Engineer" },
      { key: "duration", label: "Duration", type: "text", placeholder: "June 2022 – Present" },
      { key: "location", label: "Location", type: "text", placeholder: "Bangalore, India" },
      { key: "description", label: "Key Achievements (one per line)", type: "textarea", placeholder: "- Reduced API response time by 40%\n- Built a microservice handling 10K RPM" },
    ],
  },
  skills: {
    label: "Skills", icon: "⬡",
    fields: [
      { key: "languages", label: "Programming Languages", type: "text", placeholder: "Python, JavaScript, Java, C++" },
      { key: "frameworks", label: "Frameworks & Libraries", type: "text", placeholder: "React, Node.js, Django, FastAPI" },
      { key: "databases", label: "Databases", type: "text", placeholder: "PostgreSQL, MongoDB, Redis, MySQL" },
      { key: "cloud", label: "Cloud & DevOps", type: "text", placeholder: "AWS, Docker, Kubernetes, CI/CD" },
      { key: "ml_tools", label: "AI / ML Tools", type: "text", placeholder: "TensorFlow, PyTorch, scikit-learn, pandas" },
      { key: "tools", label: "Other Tools", type: "text", placeholder: "Git, Jira, Figma, Postman" },
    ],
  },
  projects: {
    label: "Projects", icon: "⊞", repeatable: true, itemLabel: "Project",
    fields: [
      { key: "title", label: "Project Title", type: "text", placeholder: "Project name" },
      { key: "tech", label: "Technologies Used", type: "text", placeholder: "Python, React, FastAPI, PostgreSQL" },
      { key: "link", label: "GitHub / Live Link", type: "url", placeholder: "github.com/your-project" },
      { key: "description", label: "Description & Impact", type: "textarea", placeholder: "What this project does and measurable impact.\n- 50+ users\n- 87% accuracy" },
    ],
  },
  certifications: {
    label: "Certifications", icon: "❋", repeatable: true, itemLabel: "Certificate",
    fields: [
      { key: "name", label: "Certificate Name", type: "text", placeholder: "AWS Certified Developer" },
      { key: "issuer", label: "Issued By", type: "text", placeholder: "Amazon Web Services" },
      { key: "year", label: "Year", type: "text", placeholder: "2024" },
      { key: "link", label: "Certificate Link", type: "url", placeholder: "credly.com/..." },
    ],
  },
  achievements: {
    label: "Achievements", icon: "◉",
    fields: [
      { key: "items", label: "Achievements (one per line)", type: "textarea", placeholder: "- First place, Smart India Hackathon\n- Google Developer Student Club Lead\n- LeetCode top 5% (1800+ rating)" },
    ],
  },
  internships: {
    label: "Internships", icon: "◇", repeatable: true, itemLabel: "Internship",
    fields: [
      { key: "company", label: "Company Name", type: "text", placeholder: "Google / Startup name" },
      { key: "role", label: "Internship Role", type: "text", placeholder: "Data Science Intern" },
      { key: "duration", label: "Duration", type: "text", placeholder: "May 2024 – July 2024" },
      { key: "stipend", label: "Stipend (optional)", type: "text", placeholder: "Rs. 15,000/month" },
      { key: "description", label: "Work Done & Learnings", type: "textarea", placeholder: "- Performed data analysis in Python\n- Deployed an ML model\n- Improved accuracy by 20%" },
    ],
  },
};

const SECTION_ORDER = ["personal", "education", "internships", "experience", "skills", "projects", "certifications", "achievements"];const DEFAULT_STYLE = { fontFamily: "'DM Sans', sans-serif", primaryColor: "#6c63ff", accentColor: "#00e5a0", fontSize: 14, spacing: "normal", layout: "single" };

const DOMAIN_SKILL_FIELDS = {
  tech: [
    { key: "languages", label: "Programming Languages", type: "text", placeholder: "Python, JavaScript, Java, C++" },
    { key: "frameworks", label: "Frameworks & Libraries", type: "text", placeholder: "React, Node.js, Django, FastAPI" },
    { key: "databases", label: "Databases", type: "text", placeholder: "PostgreSQL, MongoDB, Redis, MySQL" },
    { key: "cloud", label: "Cloud & DevOps", type: "text", placeholder: "AWS, Docker, Kubernetes, CI/CD" },
    { key: "ml_tools", label: "AI / ML Tools", type: "text", placeholder: "TensorFlow, PyTorch, scikit-learn" },
    { key: "tools", label: "Other Tools", type: "text", placeholder: "Git, Jira, Figma, Postman" },
  ],
  finance: [
    { key: "software", label: "Finance Software", type: "text", placeholder: "Bloomberg, Excel, SAP, QuickBooks" },
    { key: "skills", label: "Finance Skills", type: "text", placeholder: "Financial Modeling, DCF, Valuation, IFRS, GAAP" },
    { key: "tools", label: "Analytics Tools", type: "text", placeholder: "Tableau, Power BI, Python, SQL" },
    { key: "certifications_skills", label: "Certifications / Licenses", type: "text", placeholder: "CFA Level 1, CPA, FRM" },
    { key: "other", label: "Other Skills", type: "text", placeholder: "Risk Management, Derivatives, Audit" },
  ],
  hr: [
    { key: "hris", label: "HRIS Platforms", type: "text", placeholder: "Workday, BambooHR, SAP SuccessFactors" },
    { key: "recruitment", label: "Recruitment Skills", type: "text", placeholder: "Talent Acquisition, ATS, LinkedIn Recruiter" },
    { key: "hr_skills", label: "HR Competencies", type: "text", placeholder: "Payroll, Performance Management, Employment Law" },
    { key: "tools", label: "Other Tools", type: "text", placeholder: "MS Office, Zoom, Slack, Trello" },
    { key: "certifications_skills", label: "Certifications", type: "text", placeholder: "SHRM-CP, PHR, CIPD" },
  ],
  marketing: [
    { key: "digital", label: "Digital Marketing", type: "text", placeholder: "SEO, SEM, PPC, Google Ads, Facebook Ads" },
    { key: "analytics", label: "Analytics Tools", type: "text", placeholder: "Google Analytics, HubSpot, Salesforce, Mixpanel" },
    { key: "content", label: "Content & Design", type: "text", placeholder: "Content Strategy, Copywriting, Canva, Photoshop" },
    { key: "social", label: "Social Media", type: "text", placeholder: "Instagram, LinkedIn, Twitter, TikTok, Hootsuite" },
    { key: "tools", label: "Other Tools", type: "text", placeholder: "Mailchimp, WordPress, A/B Testing, CRM" },
  ],
};

export default function ResumeBuilder({ template, navigate, domain = "tech" }) {
  const [activeSection, setActiveSection] = useState("personal");
  const [activeTab, setActiveTab] = useState("edit");
  const [formData, setFormData] = useState({});
  const [style, setStyle] = useState({ ...DEFAULT_STYLE, primaryColor: template?.preview?.accent || "#6c63ff" });
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Apply domain-specific skill fields
  const effectiveSections = {
    ...SECTION_CONFIGS,
    skills: { ...SECTION_CONFIGS.skills, fields: DOMAIN_SKILL_FIELDS[domain] || DOMAIN_SKILL_FIELDS.tech },
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── PDF Direct Download (html2pdf) ──────────────────────
  const handleExportPDF = () => {
    setExporting(true);
    setActiveTab("preview");
    setTimeout(() => {
      const el = document.getElementById("resume-preview-print");
      if (!el) {
        showToast("Preview failed to load. Please try again.", "error");
        setExporting(false);
        return;
      }
      const name = formData?.personal?.name || "Resume";
      // Direct PDF download using html2pdf CDN
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => {
        const opt = {
          margin: 0,
          filename: `${name}-SmartResume.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };
        window.html2pdf().set(opt).from(el).save().then(() => {
          setExporting(false);
          showToast(`${name}-SmartResume.pdf downloaded successfully.`);
        }).catch(() => {
          setExporting(false);
          showToast("Download failed. Please try again.", "error");
        });
      };
      script.onerror = () => {
        // Fallback: print dialog
        setExporting(false);
        window.print();
      };
      document.head.appendChild(script);
    }, 700);
  };
  // ─────────────────────────────────────────────────────────

  const handleSave = () => {
    localStorage.setItem("sr_data", JSON.stringify({ formData, style }));
    setSaved(true);
    showToast("Saved! ✅");
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sr_data");
      if (raw) { const { formData: fd } = JSON.parse(raw); if (fd) setFormData(fd); }
    } catch {}
  }, []);

  const updateField = useCallback((section, field, value, index = null) => {
    setFormData((prev) => {
      const next = { ...prev };
      if (index !== null) {
        const arr = [...(next[section] || [{}])];
        if (!arr[index]) arr[index] = {};
        arr[index] = { ...arr[index], [field]: value };
        next[section] = arr;
      } else {
        next[section] = { ...(next[section] || {}), [field]: value };
      }
      return next;
    });
  }, []);

  const addItem = (s) => setFormData((p) => ({ ...p, [s]: [...(p[s] || [{}]), {}] }));
  const removeItem = (s, i) => setFormData((p) => ({ ...p, [s]: (p[s] || []).filter((_, idx) => idx !== i) }));

  const visibleSections = template
    ? SECTION_ORDER.filter((s) => s === "personal" || template.fields?.includes(s))
    : SECTION_ORDER;

  const pct = () => {
    const filled = visibleSections.filter((s) => {
      const d = formData[s];
      if (!d) return false;
      if (Array.isArray(d)) return d.length > 0;
      return Object.values(d).some((v) => v?.trim?.());
    }).length;
    return Math.round((filled / visibleSections.length) * 100);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg2)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate("templates")} style={{ padding: "8px 14px", fontSize: 13 }}>← Back</button>
          <div className="nav-logo" onClick={() => navigate("landing")} style={{ fontSize: 18, cursor: "pointer" }}>SmartResume AI</div>
          <div className="badge badge-purple" style={{ fontSize: 12 }}>{template?.name || "Resume"}</div>
          <div style={{ fontSize: 11, padding: "3px 10px", borderRadius: 50, background: "rgba(0,229,160,0.12)", color: "var(--green)", border: "1px solid rgba(0,229,160,0.25)", textTransform: "capitalize" }}>
            {domain} domain
          </div>
        </div>

        <div className="tabs" style={{ background: "var(--surface)" }}>
          {[{ id: "edit", label: "Edit" }, { id: "preview", label: "Preview" }, { id: "ai-suite", label: "AI Suite" }, { id: "ai", label: "AI Score" }, { id: "jd", label: "JD Match" }].map((t) => (
            <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>{pct()}% complete</div>
          <div className="progress-bar" style={{ width: 80 }}>
            <div className="progress-bar-fill" style={{ "--target-width": `${pct()}%` }} />
          </div>
          <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={handleSave}>{saved ? "✓ Saved" : "Save"}</button>
          <button className="btn btn-primary" style={{ padding: "8px 18px", fontSize: 13, opacity: exporting ? 0.7 : 1 }} onClick={handleExportPDF} disabled={exporting}>
            {exporting ? "⏳ Preparing..." : "Export PDF ↓"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {activeTab === "edit" && (
          <>
            {/* Section nav */}
            <div style={{ width: 200, borderRight: "1px solid var(--border)", background: "var(--bg2)", overflowY: "auto", flexShrink: 0, padding: 16 }}>
              {visibleSections.map((sec) => {
                const cfg = effectiveSections[sec];
                const d = formData[sec];
                const filled = d && (Array.isArray(d) ? d.length > 0 : Object.values(d).some((v) => v));
                return (
                  <button key={sec} onClick={() => setActiveSection(sec)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 10, border: "none", marginBottom: 4,
                    background: activeSection === sec ? "rgba(108,99,255,0.15)" : "transparent",
                    color: activeSection === sec ? "var(--accent2)" : "var(--text2)",
                    cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)", textAlign: "left",
                    borderLeft: activeSection === sec ? "2px solid var(--accent)" : "2px solid transparent",
                    transition: "all 0.15s",
                  }}>
                    <span>{cfg.icon}</span>
                    <span style={{ flex: 1 }}>{cfg.label}</span>
                    {filled && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <div style={{ flex: 1, overflowY: "auto", padding: 32, background: "var(--bg)" }}>
              <SectionForm section={activeSection} config={effectiveSections[activeSection]} data={formData[activeSection]} onUpdate={updateField} onAdd={addItem} onRemove={removeItem} />
            </div>

            {/* Mini preview */}
            <div style={{ width: 360, borderLeft: "1px solid var(--border)", background: "var(--bg2)", overflowY: "auto", flexShrink: 0 }}>
              <div style={{ padding: 16, borderBottom: "1px solid var(--border)", fontSize: 12, color: "var(--text3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Live Preview</span>
                <button className="btn btn-ghost" style={{ padding: "4px 12px", fontSize: 11 }} onClick={() => setActiveTab("preview")}>Full Preview →</button>
              </div>
              <div style={{ padding: 16, transform: "scale(0.75)", transformOrigin: "top center", pointerEvents: "none" }}>
                <ResumePreview formData={formData} style={style} template={template} />
              </div>
            </div>
          </>
        )}

        {activeTab === "preview" && (
          <div style={{ flex: 1, overflowY: "auto", background: "var(--bg3)", padding: 40 }}>
            <div style={{ maxWidth: 794, margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
                <h2 style={{ fontFamily: "var(--font-display)" }}>Resume Preview</h2>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setActiveTab("edit")}>← Edit</button>
                  <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={handleExportPDF} disabled={exporting}>
                    {exporting ? "⏳ Preparing..." : "Export PDF ↓"}
                  </button>
                </div>
              </div>
              {/* This div is captured for PDF export */}
              <div id="resume-preview-print">
                <ResumePreview formData={formData} style={style} template={template} fullPage />
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 40 }}>
            <AIPredictor formData={formData} template={template} domain={domain} />
          </div>
        )}

        {activeTab === "ai-suite" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 40 }}>
            <AISuite
              formData={formData}
              onFormDataUpdate={(newData) => {
                setFormData(newData);
                setActiveTab("edit");
              }}
            />
          </div>
        )}

        {activeTab === "jd" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 40 }}>
            <JDMatcher formData={formData} onUpdate={setFormData} />
          </div>
        )}

        {activeTab === "preview" && (
          <div style={{ width: 280, borderLeft: "1px solid var(--border)", background: "var(--bg2)", overflowY: "auto", flexShrink: 0 }}>
            <Customizer style={style} onStyleChange={setStyle} />
          </div>
        )}
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function SectionForm({ section, config, data, onUpdate, onAdd, onRemove }) {
  if (!config) return null;
  const isRepeatable = config.repeatable;
  const items = isRepeatable ? (Array.isArray(data) ? data : [{}]) : [data || {}];

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>{config.icon}</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>{config.label}</h2>
        </div>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          {isRepeatable ? `You can add multiple ${config.itemLabel?.toLowerCase()} entries.` : "Fill in your details."}
        </p>
      </div>

      {items.map((item, idx) => (
        <div key={idx} style={{ background: "var(--surface)", borderRadius: 16, padding: 24, marginBottom: 20, border: "1px solid var(--border)" }}>
          {isRepeatable && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>{config.itemLabel} {idx + 1}</div>
              {idx > 0 && (
                <button onClick={() => onRemove(section, idx)} style={{ background: "rgba(239,68,68,0.1)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 12 }}>
                  Remove
                </button>
              )}
            </div>
          )}
          <div className="grid-2">
            {config.fields.map((field) => (
              <div key={field.key} className="form-group" style={{ gridColumn: field.type === "textarea" ? "1 / -1" : "auto" }}>
                <label className="label">{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea className="input" placeholder={field.placeholder} rows={5}
                    value={isRepeatable ? (item[field.key] || "") : (data?.[field.key] || "")}
                    onChange={(e) => onUpdate(section, field.key, e.target.value, isRepeatable ? idx : null)} />
                ) : (
                  <input className="input" type={field.type} placeholder={field.placeholder}
                    value={isRepeatable ? (item[field.key] || "") : (data?.[field.key] || "")}
                    onChange={(e) => onUpdate(section, field.key, e.target.value, isRepeatable ? idx : null)} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {isRepeatable && (
        <button onClick={() => onAdd(section)}
          style={{ width: "100%", padding: "14px", border: "2px dashed var(--border)", borderRadius: 14, background: "transparent", color: "var(--text2)", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-body)", transition: "all 0.2s" }}
          onMouseOver={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
          onMouseOut={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text2)"; }}>
          + Add Another {config.itemLabel}
        </button>
      )}
    </div>
  );
}

