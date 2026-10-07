import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

/* =========================================================
   CONSTANTS
   ========================================================= */

const NAV_ITEMS = [
  { path: "/applicant", label: "Home", icon: "home" },
  { path: "/applicant/jobs", label: "Find Jobs", icon: "briefcase" },
  { path: "/applicant/applications", label: "Applications", icon: "clipboard" },
  { path: "/applicant/upload-resume", label: "Resume", icon: "file" },
  { path: "/applicant/profile", label: "Profile", icon: "user" },
];

const SESSION_KEYS = ["token", "userUuid", "role", "name", "email"];

// Simple line icons (they inherit the text color)
const ICONS = {
  home: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  clipboard: (
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
};

/* =========================================================
   SMALL REUSABLE COMPONENT
   ========================================================= */

function NavIcon({ name }) {
  return (
    <svg
      className="applicant-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

const clearSession = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};

/* =========================================================
   APPLICANT LAYOUT
   ========================================================= */

function ApplicantLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  /* ---------- Load the logged-in user ---------- */
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const response = await api.get("/users/me");

        if (mounted) {
          setUser(response);
        }
      } catch (error) {
        if (mounted) {
          clearSession();

          navigate("/login", { replace: true });
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /* ---------- Logout ---------- */
  const handleLogout = async () => {
    try {
      await api.post("/users/logout", {});
    } catch (error) {
      // Continue with local logout even if API logout fails.
    } finally {
      clearSession();

      navigate("/login", { replace: true });
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }

  /* ---------- UI ---------- */
  return (
    <div className="applicant-layout">

      {/* ==================== SIDEBAR ==================== */}
      <aside className="applicant-navbar">

        {/* Brand */}
        <button
          type="button"
          className="applicant-brand"
          onClick={() => navigate("/applicant")}
        >
          <div className="applicant-brand-logo">RS</div>

          <div className="applicant-brand-text">
            <strong>ResumeScreen</strong>
            <span>Career Portal</span>
          </div>
        </button>

        {/* Navigation (left sidebar; bottom tab bar on phones) */}
        <nav className="applicant-navbar-links" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`applicant-navbar-link${
                isActive(item.path) ? " active" : ""
              }`}
              aria-current={isActive(item.path) ? "page" : undefined}
              title={item.label}
              onClick={() => navigate(item.path)}
            >
              <NavIcon name={item.icon} />
              <span className="applicant-navbar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User section */}
        <div className="applicant-navbar-user">
          <button
            type="button"
            className="applicant-user-button"
            onClick={() => navigate("/applicant/profile")}
          >
            <div className="applicant-user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>

            <div className="applicant-user-details">
              <strong>{user.name || "Applicant"}</strong>
              <strong>{user.email}</strong>

              <span>Applicant</span>
            </div>
          </button>

          <button
            type="button"
            className="applicant-logout-button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <NavIcon name="logout" />
            <span className="applicant-logout-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ==================== PAGE CONTENT ==================== */}
      <main className="applicant-layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default ApplicantLayout;