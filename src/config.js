
const API_URL = (() => {
  // Use VITE_API_URL if provided
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }

  // By default, use a relative path so the Vite proxy (local) 
  // or Vercel Rewrites (production) will handle the /api routes automatically.
  return "";
})();

export default API_URL;
