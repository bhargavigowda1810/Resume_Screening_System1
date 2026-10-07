import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

/* =========================================================
   CONSTANTS
   ========================================================= */

const NAV_ITEMS = [
  { path: "/recruiter", label: "Home", icon: "home" },
  { path: "/recruiter/create-job", label: "Create Job", icon: "plus" },
  { path: "/recruiter/jobs", label: "My Jobs", icon: "briefcase" },
  { path: "/recruiter/applicants", label: "Applicants", icon: "users" },
  { path: "/recruiter/profile", label: "Profile", icon: "user" },
];

const SESSION_KEYS = ["token", "userUuid", "role", "name", "email"];

/* =========================================================
   ICONS (simple line icons that inherit the text color)
   ========================================================= */

const ICONS = {
  home: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),

  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),

  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),

  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
      className="recruiter-icon"
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
  SESSION_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
};

/* =========================================================
   RECRUITER LAYOUT
   ========================================================= */

function RecruiterLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  /* ---------- Load the logged-in recruiter ---------- */
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const response = await api.get("/users/me");

        if (mounted) {
          setUser(response);
        }
      } catch (error) {
        console.error("Unable to load current recruiter:", error);

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

  /* ---------- Active navigation item ----------
     A link is active on its own page and on pages inside it,
     e.g. /recruiter/jobs/12 keeps "My Jobs" highlighted.
     "Home" is only active on /recruiter itself. */
  const isActive = (path) => {
    if (path === "/recruiter") {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  /* ---------- Wait for the user ---------- */
  if (!user) {
    return null;
  }

  /* ---------- UI ---------- */
  return (
    <div className="recruiter-layout">

      {/* ==================== SIDEBAR ==================== */}
      <aside className="recruiter-navbar">

        {/* Brand */}
        <button
          type="button"
          className="recruiter-brand"
          onClick={() => navigate("/recruiter")}
        >
          <div className="recruiter-brand-logo">RS</div>

          <div className="recruiter-brand-text">
            <strong>ResumeScreen</strong>

            <span>Recruiter Portal</span>
          </div>
        </button>

        {/* Navigation (left sidebar; bottom tab bar on phones) */}
        <nav className="recruiter-navbar-links" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`recruiter-navbar-link${
                isActive(item.path) ? " active" : ""
              }`}
              aria-current={isActive(item.path) ? "page" : undefined}
              title={item.label}
              onClick={() => navigate(item.path)}
            >
              <NavIcon name={item.icon} />

              <span className="recruiter-navbar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User section */}
        <div className="recruiter-navbar-user">

          {/* Profile button */}
          <button
            type="button"
            className="recruiter-user-button"
            onClick={() => navigate("/recruiter/profile")}
          >
            <div className="recruiter-user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : "R"}
            </div>

            <div className="recruiter-user-details">
              <strong>{user.name || "Recruiter"}</strong>

              {user.email && <span>{user.email}</span>}
            </div>
          </button>

          {/* Logout */}
          <button
            type="button"
            className="recruiter-logout-button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <NavIcon name="logout" />

            <span className="recruiter-logout-label">Logout</span>
          </button>

        </div>

      </aside>

      {/* ==================== PAGE CONTENT ==================== */}
      <main className="recruiter-layout-content">
        <Outlet />
      </main>

    </div>
  );
}

export default RecruiterLayout;