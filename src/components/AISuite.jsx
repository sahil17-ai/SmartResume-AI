import { useEffect, useState } from "react";
import API from "../config";
async function fetchWithTimeout(url, options = {}, timeoutMs = 45000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableError(error) {
  const msg = String(error?.message || "").toLowerCase();
  if (error?.name === "AbortError") return true;
  return (
    msg.includes("timeout") ||
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("502") ||
    msg.includes("503") ||
    msg.includes("504") ||
    msg.includes("temporarily unavailable")
  );
}

async function requestJSON(url, options = {}, { timeoutMs = 45000, retries = 1 } = {}) {
  let lastError;
  const endpoint = url.startsWith("http") ? url : `${API}${url}`;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetchWithTimeout(endpoint, options, timeoutMs);
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        throw new Error(data.detail || `Request failed (${res.status})`);
      }
      return data;
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRetryableError(error)) {
        throw error;
      }
      await delay(600 * (attempt + 1));
    }
  }
  throw lastError;
}

function getErrorMessage(error) {
  if (error?.name === "AbortError") {
    return "Request timed out. Please try again.";
  }
  return error?.message || "Something went wrong. Please try again.";
}

export default function AISuite({ formData, onFormDataUpdate }) {
  const [activeTab, setActiveTab] = useState("bullets");

  const tabs = [
    { id: "bullets", label: "Bullet Optimizer" },
    { id: "cover", label: "Cover Letter" },
    { id: "interview", label: "Interview Prep" },
    { id: "upload", label: "Upload PDF" },
  ];

  return (
    <div style={{ fontFamily: "var(--font-body)", maxWidth: 920, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 6 }}>
          <span className="gradient-text">AI Suite</span>
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 15 }}>
          Faster resume tools with clean outputs and ATS-friendly formatting.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: "1.5px solid",
              borderColor: activeTab === tab.id ? "var(--accent)" : "var(--border)",
              background: activeTab === tab.id ? "var(--accent)" : "transparent",
              color: activeTab === tab.id ? "#fff" : "var(--text2)",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              fontWeight: activeTab === tab.id ? 600 : 500,
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "bullets" && <BulletOptimizer formData={formData} onFormDataUpdate={onFormDataUpdate} />}
      {activeTab === "cover" && <CoverLetterGen formData={formData} />}
      {activeTab === "interview" && <InterviewPrep formData={formData} />}
      {activeTab === "upload" && <PDFUploader onFormDataUpdate={onFormDataUpdate} />}
    </div>
  );
}

function BulletOptimizer({ formData, onFormDataUpdate }) {
  const [input, setInput] = useState("");
  const [jd, setJd] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  const optimize = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setError("");
    setApplied(false);

    try {
      const data = await requestJSON("/api/ai/optimize-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullets: input, job_description: jd }),
      }, { timeoutMs: 45000, retries: 1 });
      setOutput(data.optimized || "No optimized output was returned.");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const applyToResume = () => {
    if (!output.trim() || !onFormDataUpdate) return;
    const nextData = { ...(formData || {}) };
    const experience = Array.isArray(nextData.experience) ? [...nextData.experience] : [];
    if (experience.length === 0) {
      experience.push({ company: "", role: "", duration: "", location: "", description: output.trim() });
    } else {
      experience[0] = { ...(experience[0] || {}), description: output.trim() };
    }
    nextData.experience = experience;
    onFormDataUpdate(nextData);
    setApplied(true);
  };

  return (
    <div style={responsiveGridStyle}>
      <div>
        <Panel title="Raw Bullet Points" subtitle="Write simple points. AI will rewrite them professionally.">
          <label style={labelStyle}>Your raw points</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Built dashboard in React\nFixed API issues\nImproved SQL queries"}
            rows={8}
            style={textareaStyle}
          />
          <div style={fieldHintStyle}>One point per line gives the best result.</div>

          <label style={{ ...labelStyle, marginTop: 14 }}>Job description (optional)</label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste a job description for keyword matching and ATS alignment."
            rows={4}
            style={textareaStyle}
          />

          <div style={actionsRowStyle}>
            <button
              onClick={optimize}
              disabled={loading || !input.trim()}
              className="btn btn-primary"
              style={{ flex: 1, padding: "12px", fontSize: 14, opacity: loading || !input.trim() ? 0.6 : 1 }}
            >
              {loading ? "Optimizing..." : "Optimize Bullets"}
            </button>
            <button
              onClick={() => {
                setInput("");
                setJd("");
                setOutput("");
                setError("");
              }}
              className="btn btn-ghost"
              style={{ padding: "12px 16px", fontSize: 13 }}
            >
              Clear
            </button>
          </div>
        </Panel>
      </div>

      <div>
        <Panel title="Optimized Result" subtitle="Professional and ATS-ready bullets">
          {loading && (
            <LoadingState
              steps={["Analyzing input", "Optimizing impact", "Aligning ATS keywords", "Finalizing output"]}
              caption="Usually takes 10-30 seconds."
            />
          )}

          {!loading && error && <ErrorBanner message={error} />}

          {!loading && !error && output && (
            <>
              <div style={resultBoxStyle}>{output}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <button onClick={copy} className="btn btn-ghost" style={{ flex: 1, minWidth: 180, fontSize: 13 }}>
                  {copied ? "Copied" : "Copy to Clipboard"}
                </button>
                <button onClick={applyToResume} className="btn btn-primary" style={{ flex: 1, minWidth: 180, fontSize: 13 }}>
                  {applied ? "Applied to Resume" : "Apply to Experience"}
                </button>
              </div>
              <div style={{ ...fieldHintStyle, marginTop: 10 }}>
                Apply action updates the first Work Experience description.
              </div>
            </>
          )}

          {!loading && !error && !output && (
            <div style={emptyState}>
              <p style={{ color: "var(--text2)", fontSize: 14, margin: 0 }}>
                Enter your raw bullet points and click "Optimize Bullets".
              </p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function CoverLetterGen({ formData }) {
  const [jd, setJd] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    setResult("");
    setError("");

    try {
      const data = await requestJSON("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_data: formData,
          job_description: jd,
          company_name: company,
          job_title: jobTitle,
        }),
      }, { timeoutMs: 50000, retries: 1 });
      setResult(data.cover_letter || "No cover letter was returned.");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={responsiveGridStyle}>
      <div>
        <Panel title="Job Details" subtitle="Provide a target role and description.">
          <label style={labelStyle}>Company name</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Example: Google"
            style={inputStyle}
          />

          <label style={{ ...labelStyle, marginTop: 12 }}>Job title</label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Example: Software Engineer"
            style={inputStyle}
          />

          <label style={{ ...labelStyle, marginTop: 12 }}>Job description</label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full job description here."
            rows={8}
            style={textareaStyle}
          />

          <button
            onClick={generate}
            disabled={loading || !jd.trim()}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 14, padding: "12px", fontSize: 14, opacity: loading || !jd.trim() ? 0.6 : 1 }}
          >
            {loading ? "Generating..." : "Generate Cover Letter"}
          </button>
        </Panel>
      </div>

      <div>
        <Panel title="Cover Letter Output" subtitle="Ready to review and copy">
          {loading && (
            <LoadingState
              steps={["Reading role context", "Drafting structure", "Personalizing tone", "Finalizing letter"]}
              caption="Using your resume and target role details."
            />
          )}

          {!loading && error && <ErrorBanner message={error} />}

          {!loading && !error && result && (
            <>
              <div style={{ ...resultBoxStyle, maxHeight: 500, overflowY: "auto", lineHeight: 1.9 }}>{result}</div>
              <button onClick={copy} className="btn btn-ghost" style={{ marginTop: 12, width: "100%", fontSize: 13 }}>
                {copied ? "Copied" : "Copy Cover Letter"}
              </button>
            </>
          )}

          {!loading && !error && !result && (
            <div style={emptyState}>
              <p style={{ color: "var(--text2)", fontSize: 14, margin: 0 }}>
                Fill the fields and click "Generate Cover Letter".
              </p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function InterviewPrep({ formData }) {
  const [jd, setJd] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState("");

  const typeColors = {
    Technical: "#6c63ff",
    HR: "#00e5a0",
    Behavioral: "#f59e0b",
    "Project-specific": "#ec4899",
    General: "#3b82f6",
  };

  const generate = async () => {
    setLoading(true);
    setQuestions([]);
    setError("");

    try {
      const data = await requestJSON("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_data: formData, job_description: jd }),
      }, { timeoutMs: 45000, retries: 1 });
      setQuestions(data.questions || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel title="Interview Simulator" subtitle="Generate likely questions and sample answers">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 1fr) auto", gap: 12, alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Job description (optional)</label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste a job description for more targeted interview questions."
            rows={3}
            style={textareaStyle}
          />
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="btn btn-primary"
          style={{ padding: "12px 20px", fontSize: 14, opacity: loading ? 0.6 : 1, whiteSpace: "nowrap", alignSelf: "flex-end" }}
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </div>

      {loading && (
        <LoadingState
          steps={["Analyzing profile", "Generating question set", "Building sample answers", "Preparing final list"]}
          caption="Building technical, HR, and project-focused questions."
        />
      )}
      {!loading && error && <ErrorBanner message={error} />}

      {!loading && !error && questions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {questions.map((q, i) => (
            <div
              key={i}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 14,
                overflow: "hidden",
                transition: "border-color 0.2s",
                borderColor: expanded === i ? (typeColors[q.type] || "var(--accent)") + "60" : "var(--border)",
              }}
            >
              <div
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  background: expanded === i ? "rgba(108,99,255,0.04)" : "transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 50,
                      fontSize: 11,
                      fontWeight: 600,
                      background: (typeColors[q.type] || "#6c63ff") + "20",
                      color: typeColors[q.type] || "#6c63ff",
                    }}
                  >
                    {q.type || "General"}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>Q{i + 1}: {q.question}</span>
                </div>
                <span style={{ color: "var(--text3)", fontSize: 14, flexShrink: 0 }}>{expanded === i ? "Hide" : "View"}</span>
              </div>

              {expanded === i && (
                <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
                  {q.tip && (
                    <div
                      style={{
                        background: "rgba(0,229,160,0.08)",
                        border: "1px solid rgba(0,229,160,0.2)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        marginTop: 14,
                        marginBottom: 14,
                        fontSize: 13,
                        color: "var(--green)",
                      }}
                    >
                      <strong>Tip:</strong> {q.tip}
                    </div>
                  )}
                  <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8 }}>
                    <strong style={{ color: "var(--text)" }}>Sample answer:</strong>
                    <br />
                    {q.sample_answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && questions.length === 0 && (
        <div style={emptyState}>
          <p style={{ color: "var(--text2)", fontSize: 14, margin: 0 }}>
            Click "Generate Questions" to see AI-generated interview practice.
          </p>
        </div>
      )}
    </Panel>
  );
}

function PDFUploader({ onFormDataUpdate }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const upload = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const data = await requestJSON("/api/parser/pdf", { method: "POST", body: form }, { timeoutMs: 90000, retries: 1 });
      setResult(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const applyToForm = () => {
    if (result?.form_data) {
      onFormDataUpdate(result.form_data);
      setResult({ ...result, applied: true });
    }
  };

  return (
    <Panel title="Upload Resume PDF" subtitle="Extract details and auto-fill your form">
      {!loading && !result && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            upload(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById("pdf-file-input")?.click()}
          style={{
            border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 20,
            padding: "48px 28px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "rgba(108,99,255,0.05)" : "transparent",
            transition: "all 0.2s ease",
          }}
        >
          <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>
            {dragging ? "Drop your PDF here" : "Drag and drop your resume PDF"}
          </h3>
          <p style={{ color: "var(--text2)", marginBottom: 16, fontSize: 14 }}>
            or click to browse files
          </p>
          <input
            id="pdf-file-input"
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => upload(e.target.files[0])}
          />
          <div className="btn btn-ghost" style={{ display: "inline-block", padding: "10px 22px" }}>
            Choose PDF File
          </div>
        </div>
      )}

      {loading && (
        <LoadingState
          steps={["Uploading PDF", "Extracting text", "Structuring resume data", "Preparing autofill result"]}
          caption="Extracting education, experience, projects, and skills."
        />
      )}

      {!loading && error && <ErrorBanner message={error} />}

      {!loading && result && (
        <div>
          <div
            style={{
              background: "rgba(0,229,160,0.08)",
              border: "1px solid rgba(0,229,160,0.3)",
              borderRadius: 16,
              padding: "18px 22px",
              marginBottom: 14,
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--green)", marginBottom: 6 }}>PDF parsed successfully</div>
            <div style={{ fontSize: 14, color: "var(--text2)" }}>
              Found: <strong>{result.form_data?.personal?.name || "Candidate"}</strong>,{" "}
              {result.form_data?.education?.length || 0} education entries, {result.form_data?.experience?.length || 0} experience entries, {result.form_data?.projects?.length || 0} projects
            </div>
          </div>

          {result.applied ? (
            <div style={{ textAlign: "center", padding: "16px", color: "var(--green)", fontWeight: 600, fontSize: 15 }}>
              Form updated successfully. Open Edit to review details.
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={applyToForm} className="btn btn-primary" style={{ flex: 1, minWidth: 220, padding: "12px", fontSize: 14 }}>
                Apply Data to Form
              </button>
              <button onClick={() => setResult(null)} className="btn btn-ghost" style={{ padding: "12px 18px", fontSize: 14 }}>
                Upload Another PDF
              </button>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

function LoadingState({ steps = [], caption }) {
  const normalizedSteps = steps.length > 0 ? steps : ["Processing"];
  const [dots, setDots] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 350);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (normalizedSteps.length <= 1) return undefined;
    const id = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % normalizedSteps.length);
    }, 1500);
    return () => clearInterval(id);
  }, [normalizedSteps.length]);

  return (
    <div style={loadingBox}>
      <div style={spinnerStyle} />
      <div style={{ color: "var(--text)", fontSize: 15, fontWeight: 600 }}>
        {normalizedSteps[activeStep]}
        {dots}
      </div>
      {caption && <div style={{ color: "var(--text3)", fontSize: 13 }}>{caption}</div>}
      {normalizedSteps.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {normalizedSteps.map((step, idx) => (
            <div
              key={step}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: idx === activeStep ? "var(--accent)" : "rgba(108,99,255,0.22)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div
      style={{
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: 12,
        padding: 14,
        color: "var(--red)",
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: "var(--text3)" }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

const responsiveGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 20,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--text2)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  boxSizing: "border-box",
  outline: "none",
};

const textareaStyle = { ...inputStyle, resize: "vertical", minHeight: 90 };

const fieldHintStyle = {
  color: "var(--text3)",
  fontSize: 12,
  marginTop: 6,
};

const actionsRowStyle = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  marginTop: 14,
};

const resultBoxStyle = {
  background: "rgba(108,99,255,0.06)",
  border: "1px solid rgba(108,99,255,0.2)",
  borderRadius: 12,
  padding: 18,
  fontSize: 14,
  lineHeight: 1.85,
  whiteSpace: "pre-line",
  color: "var(--text)",
  minHeight: 220,
};

const loadingBox = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: "40px 20px",
  minHeight: 220,
  justifyContent: "center",
  textAlign: "center",
};

const emptyState = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "50px 20px",
  textAlign: "center",
  minHeight: 220,
  justifyContent: "center",
  border: "1px dashed var(--border)",
  borderRadius: 12,
};

const spinnerStyle = {
  width: 46,
  height: 46,
  borderRadius: "50%",
  border: "4px solid rgba(108,99,255,0.2)",
  borderTop: "4px solid var(--accent)",
  animation: "spin 0.8s linear infinite",
};
