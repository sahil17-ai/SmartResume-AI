export default function ResumePreview({ formData, style, template, fullPage }) {
  const p = formData.personal || {};
  const internships = Array.isArray(formData.internships) ? formData.internships : [];
  const edu = Array.isArray(formData.education) ? formData.education : [];
  const exp = Array.isArray(formData.experience) ? formData.experience : [];
  const skills = formData.skills || {};
  const projects = Array.isArray(formData.projects) ? formData.projects : [];
  const certs = Array.isArray(formData.certifications) ? formData.certifications : [];
  const achievements = formData.achievements || {};

  const color = style?.primaryColor || "#6c63ff";
  const font = style?.fontFamily || "'DM Sans', sans-serif";
  const fontSize = style?.fontSize || 14;
  const spacing = style?.spacing === "compact" ? 0.7 : style?.spacing === "spacious" ? 1.4 : 1;
  const isSidebar = style?.layout === "sidebar";

  const base = {
    fontFamily: font,
    fontSize: `${fontSize}px`,
    color: "#1a1a2e",
    background: "#ffffff",
    borderRadius: fullPage ? 0 : 12,
    overflow: "hidden",
    lineHeight: 1.5,
    minHeight: fullPage ? "100%" : 0,
    boxShadow: fullPage ? "0 4px 40px rgba(0,0,0,0.15)" : "none",
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: `${20 * spacing}px` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: `${8 * spacing}px` }}>
        <div style={{ fontWeight: 700, fontSize: `${fontSize * 0.85}px`, textTransform: "uppercase", letterSpacing: 1.5, color }}>{title}</div>
        <div style={{ flex: 1, height: 1.5, background: color, opacity: 0.25 }} />
      </div>
      {children}
    </div>
  );

  const mainContent = (
    <>
      {/* Education */}
      {edu.length > 0 && (
        <Section title="Education">
          {edu.map((e, i) => (
            <div key={i} style={{ marginBottom: `${12 * spacing}px` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 600, fontSize: `${fontSize}px` }}>{e.degree || "Degree"}</div>
                <div style={{ fontSize: `${fontSize * 0.85}px`, color: "#666" }}>{e.year}</div>
              </div>
              <div style={{ color: "#555", fontSize: `${fontSize * 0.9}px` }}>{e.college}</div>
              {e.cgpa && <div style={{ color, fontSize: `${fontSize * 0.85}px`, fontWeight: 600 }}>{e.cgpa}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* Internships */}
      {internships.length > 0 && (
        <Section title="Internships">
          {internships.map((e, i) => (
            <div key={i} style={{ marginBottom: `${14 * spacing}px` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <div style={{ fontWeight: 600 }}>{e.role}</div>
                <div style={{ fontSize: `${fontSize * 0.85}px`, color: "#666" }}>{e.duration}</div>
              </div>
              <div style={{ color, fontWeight: 500, fontSize: `${fontSize * 0.9}px`, marginBottom: 2 }}>{e.company}{e.stipend ? ` • ${e.stipend}` : ""}</div>
              {e.description && <div style={{ fontSize: `${fontSize * 0.9}px`, color: "#555", whiteSpace: "pre-line", lineHeight: 1.6 }}>{e.description}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* Experience */}
      {exp.length > 0 && (
        <Section title="Experience">
          {exp.map((e, i) => (
            <div key={i} style={{ marginBottom: `${14 * spacing}px` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <div style={{ fontWeight: 600 }}>{e.role}</div>
                <div style={{ fontSize: `${fontSize * 0.85}px`, color: "#666" }}>{e.duration}</div>
              </div>
              <div style={{ color, fontWeight: 500, fontSize: `${fontSize * 0.9}px`, marginBottom: 4 }}>{e.company}</div>
              {e.description && (
                <div style={{ fontSize: `${fontSize * 0.9}px`, color: "#555", whiteSpace: "pre-line", lineHeight: 1.6 }}>{e.description}</div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: `${12 * spacing}px` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                {p.link && <div style={{ fontSize: `${fontSize * 0.8}px`, color, textDecoration: "underline" }}>View →</div>}
              </div>
              {p.tech && <div style={{ fontSize: `${fontSize * 0.85}px`, color, marginBottom: 3 }}>{p.tech}</div>}
              {p.description && <div style={{ fontSize: `${fontSize * 0.85}px`, color: "#555", whiteSpace: "pre-line" }}>{p.description}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* Certifications */}
      {certs.length > 0 && (
        <Section title="Certifications">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {certs.map((c, i) => (
              <div key={i} style={{ padding: "4px 12px", borderRadius: 50, background: color + "15", border: `1px solid ${color}30`, fontSize: `${fontSize * 0.85}px`, color: "#333" }}>
                {c.name} {c.year ? `(${c.year})` : ""}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Achievements */}
      {achievements.items && (
        <Section title="Achievements">
          <div style={{ fontSize: `${fontSize * 0.9}px`, color: "#555", whiteSpace: "pre-line", lineHeight: 1.7 }}>{achievements.items}</div>
        </Section>
      )}
    </>
  );

  const skillsContent = Object.entries(skills).filter(([, v]) => v).length > 0 && (
    <Section title="Skills">
      {Object.entries(skills).filter(([, v]) => v).map(([key, val]) => (
        <div key={key} style={{ marginBottom: `${6 * spacing}px` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ fontSize: `${fontSize * 0.8}px`, textTransform: "uppercase", letterSpacing: 0.5, color: "#999", minWidth: 80, paddingTop: 2 }}>
              {key === "ml_tools" ? "AI/ML" : key.charAt(0).toUpperCase() + key.slice(1)}
            </div>
            <div style={{ fontSize: `${fontSize * 0.9}px`, color: "#333", flex: 1 }}>{val}</div>
          </div>
        </div>
      ))}
    </Section>
  );

  return (
    <div style={base}>
      {/* Header */}
      <div style={{ background: color, padding: `${24 * spacing}px 28px`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: `${fontSize * 1.8}px`, fontWeight: 800, color: "#fff", marginBottom: 4, letterSpacing: -0.5 }}>
            {p.name || ""}
          </div>
          <div style={{ fontSize: `${fontSize}px`, color: "rgba(255,255,255,0.85)", marginBottom: 10 }}>
            {p.title || ""}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: `${fontSize * 0.8}px`, color: "rgba(255,255,255,0.75)" }}>
            {p.email && <span>✉ {p.email}</span>}
            {p.phone && <span>☎ {p.phone}</span>}
            {p.location && <span>◎ {p.location}</span>}
            {p.linkedin && <span>⬡ LinkedIn</span>}
            {p.github && <span>⊞ GitHub</span>}
          </div>
        </div>
      </div>

      <div style={{ display: isSidebar ? "flex" : "block" }}>
        {/* Sidebar */}
        {isSidebar && (
          <div style={{ width: 200, background: "#f8f9ff", padding: "20px 16px", borderRight: `3px solid ${color}20`, flexShrink: 0 }}>
            {skillsContent}
          </div>
        )}

        <div style={{ padding: "20px 28px", flex: 1 }}>
          {/* Summary */}
          {p.summary && (
            <div style={{ marginBottom: `${16 * spacing}px`, paddingBottom: `${12 * spacing}px`, borderBottom: `1px solid ${color}20` }}>
              <div style={{ fontSize: `${fontSize * 0.9}px`, color: "#444", lineHeight: 1.7, fontStyle: "italic" }}>{p.summary}</div>
            </div>
          )}

          {/* Skills (non-sidebar) */}
          {!isSidebar && skillsContent}

          {mainContent}
        </div>
      </div>
    </div>
  );
}
