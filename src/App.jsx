import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import TemplateSelect from "./pages/TemplateSelect";
import ResumeBuilder from "./pages/ResumeBuilder";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import "./index.css";

function AppInner() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState(() => {
    if (window.location.pathname === "/admin") return "admin";
    return "landing";
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState("tech");

  const navigate = (to, data = {}) => {
    if (data.template) setSelectedTemplate(data.template);
    if (data.resumeData) setResumeData(data.resumeData);
    if (data.domain) setSelectedDomain(data.domain);
    // Protect these pages — redirect to auth if not logged in
    if ((to === "dashboard" || to === "templates" || to === "builder") && !user) {
      setPage("auth");
      window.scrollTo(0, 0);
      return;
    }
    setPage(to);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text2)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      {page === "landing" && <LandingPage navigate={navigate} />}
      {page === "auth" && <AuthPage navigate={navigate} />}
      {page === "templates" && <TemplateSelect navigate={navigate} selectedDomain={selectedDomain} setSelectedDomain={setSelectedDomain} />}
      {page === "builder" && (
        <ResumeBuilder template={selectedTemplate} initialData={resumeData} navigate={navigate} domain={selectedDomain} />
      )}
      {page === "dashboard" && <Dashboard navigate={navigate} />}
      {page === "admin" && <AdminPanel navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
