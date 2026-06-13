const FONTS = [
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
  { label: "Syne", value: "'Syne', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Garamond", value: "Garamond, serif" },
];

const COLORS = [
  "#6c63ff", "#00e5a0", "#ec4899", "#f59e0b", "#06b6d4",
  "#8b5cf6", "#ef4444", "#10b981", "#f97316", "#3b82f6",
];

const SPACINGS = ["compact", "normal", "spacious"];
const LAYOUTS = ["single", "double", "sidebar"];

export default function Customizer({ style, onStyleChange }) {
  const update = (key, val) => onStyleChange((prev) => ({ ...prev, [key]: val }));

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
        Customize Style
      </div>

      {/* Font */}
      <div className="form-group">
        <label className="label">Font Family</label>
        <select className="input" value={style.fontFamily} onChange={(e) => update("fontFamily", e.target.value)} style={{ cursor: "pointer" }}>
          {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Primary Color */}
      <div className="form-group">
        <label className="label">Primary Color</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {COLORS.map((c) => (
            <div
              key={c}
              onClick={() => update("primaryColor", c)}
              style={{
                width: 32, height: 32, borderRadius: "50%", background: c,
                cursor: "pointer", border: style.primaryColor === c ? "3px solid white" : "3px solid transparent",
                boxShadow: style.primaryColor === c ? `0 0 0 2px ${c}` : "none",
                transition: "all 0.15s",
              }}
            />
          ))}
          <input type="color" value={style.primaryColor} onChange={(e) => update("primaryColor", e.target.value)}
            style={{ width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer", background: "transparent" }} />
        </div>
      </div>

      {/* Font size */}
      <div className="form-group">
        <label className="label">Font Size: {style.fontSize}px</label>
        <input type="range" min="11" max="16" value={style.fontSize} onChange={(e) => update("fontSize", Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent)" }} />
      </div>

      {/* Spacing */}
      <div className="form-group">
        <label className="label">Spacing</label>
        <div className="tabs" style={{ background: "var(--bg3)" }}>
          {SPACINGS.map((s) => (
            <button key={s} className={`tab ${style.spacing === s ? "active" : ""}`} onClick={() => update("spacing", s)} style={{ fontSize: 12, padding: "6px 14px", textTransform: "capitalize" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Layout */}
      <div className="form-group">
        <label className="label">Layout</label>
        <div className="tabs" style={{ background: "var(--bg3)" }}>
          {LAYOUTS.map((l) => (
            <button key={l} className={`tab ${style.layout === l ? "active" : ""}`} onClick={() => update("layout", l)} style={{ fontSize: 12, padding: "6px 14px", textTransform: "capitalize" }}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
