import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

/* =========================================================
   HELPERS
   ========================================================= */

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const MAX_RECRUITERS_SHOWN = 5;
const MAX_INDUSTRIES_SHOWN = 5;

/* =========================================================
   ADMIN HOME (DASHBOARD)
   ========================================================= */

function AdminDashboard() {
  const navigate = useNavigate();

  // The administrator's own name (for the greeting)
  const [adminName, setAdminName] = useState("");

  // =========================
  // Recruiter Statistics
  // =========================
  const [recruiters, setRecruiters] = useState([]);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);
  const [recruiterListError, setRecruiterListError] = useState("");

  // =========================
  // Load Recruiters
  // =========================
  const loadRecruiters = async () => {
    setLoadingRecruiters(true);
    setRecruiterListError("");

    try {
      const response = await api.get("/users/admin/recruiters");

      setRecruiters(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to load recruiters:", error);

      setRecruiterListError(
        error?.message || "Unable to load recruiter accounts."
      );
    } finally {
      setLoadingRecruiters(false);
    }
  };

  // =========================
  // Load On Page Load
  // =========================
  useEffect(() => {
    loadRecruiters();
  }, []);

  // The greeting uses the administrator's name when it is available.
  // If this request fails, the page simply says "Administrator".
  useEffect(() => {
    let mounted = true;

    const loadAdmin = async () => {
      try {
        const response = await api.get("/users/me");

        if (mounted && response?.name) {
          setAdminName(response.name);
        }
      } catch (error) {
        console.error("Unable to load administrator name:", error);
      }
    };

    loadAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================
  // Statistics
  // =========================
  const totalRecruiters = recruiters.length;

  const verifiedRecruiters = recruiters.filter(
    (recruiter) => recruiter.emailVerified === true
  ).length;

  const pendingRecruiters = totalRecruiters - verifiedRecruiters;

  const verifiedPercent =
    totalRecruiters > 0
      ? Math.round((verifiedRecruiters / totalRecruiters) * 100)
      : 0;

  // Recruiters by industry (only when the industry is known)
  const industryCounts = {};

  recruiters.forEach((recruiter) => {
    if (recruiter.industry) {
      industryCounts[recruiter.industry] =
        (industryCounts[recruiter.industry] || 0) + 1;
    }
  });

  const industries = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_INDUSTRIES_SHOWN);

  const shownRecruiters = recruiters.slice(0, MAX_RECRUITERS_SHOWN);

  const firstName = adminName.trim().split(" ")[0] || "Administrator";

  // Banner message and button
  let heroMessage;
  let heroButton;

  if (loadingRecruiters && totalRecruiters === 0) {
    heroMessage = "Loading your recruiter statistics...";
    heroButton = null;
  } else if (totalRecruiters === 0) {
    heroMessage =
      "There are no recruiter accounts yet. Create the first recruiter to get started.";

    heroButton = {
      label: "Create Recruiter",
      path: "/admin/create-recruiter",
    };
  } else if (pendingRecruiters > 0) {
    heroMessage = `${pendingRecruiters} of ${totalRecruiters} recruiter ${
      totalRecruiters === 1 ? "account is" : "accounts are"
    } waiting for email verification.`;

    heroButton = {
      label: "View Recruiters",
      path: "/admin/recruiters",
    };
  } else {
    heroMessage = `All ${totalRecruiters} recruiter ${
      totalRecruiters === 1 ? "account is" : "accounts are"
    } verified and active.`;

    heroButton = {
      label: "Create Recruiter",
      path: "/admin/create-recruiter",
    };
  }

  /* =========================
     UI
     ========================= */

  return (
    <div className="admin-home">

      {/* ==================== WELCOME ==================== */}
      <section className="ahome-hero">

        <div className="ahome-hero-text">
          <span className="ahome-hero-badge">{getGreeting()}</span>

          <h1>Welcome back, {firstName}!</h1>

          <p>{heroMessage}</p>
        </div>

        {heroButton && (
          <div className="ahome-hero-actions">
            <button
              type="button"
              className="ahome-primary-btn"
              onClick={() => navigate(heroButton.path)}
            >
              {heroButton.label}
              <span>→</span>
            </button>
          </div>
        )}

      </section>

      {/* ==================== ERROR ==================== */}
      {recruiterListError && (
        <div className="ahome-alert" role="alert">

          <span>!</span>

          <p>{recruiterListError}</p>

          <button
            type="button"
            className="ahome-link-btn"
            onClick={loadRecruiters}
            disabled={loadingRecruiters}
          >
            Try again
          </button>

        </div>
      )}

      {/* ==================== STATS ==================== */}
      <section className="ahome-stats">

        <button
          type="button"
          className="ahome-stat-card"
          onClick={() => navigate("/admin/recruiters")}
        >
          <span className="ahome-stat-icon ahome-stat-total">👥</span>

          <div>
            <strong>{loadingRecruiters ? "..." : totalRecruiters}</strong>
            <span>Total Recruiters</span>
          </div>
        </button>

        <button
          type="button"
          className="ahome-stat-card"
          onClick={() => navigate("/admin/recruiters")}
        >
          <span className="ahome-stat-icon ahome-stat-success">✓</span>

          <div>
            <strong>{loadingRecruiters ? "..." : verifiedRecruiters}</strong>
            <span>Verified</span>
          </div>
        </button>

        <button
          type="button"
          className="ahome-stat-card"
          onClick={() => navigate("/admin/recruiters")}
        >
          <span className="ahome-stat-icon ahome-stat-progress">⏳</span>

          <div>
            <strong>{loadingRecruiters ? "..." : pendingRecruiters}</strong>
            <span>Pending Verification</span>
          </div>
        </button>

      </section>

      {/* ==================== MAIN GRID ==================== */}
      <div className="ahome-grid">

        {/* ---------- LEFT COLUMN ---------- */}
        <div className="ahome-main">

          <section className="ahome-card">

            <div className="ahome-card-header">
              <div>
                <h2>Recruiter Accounts</h2>
                <p>An overview of your recruiter accounts</p>
              </div>

              <div className="ahome-card-actions">

                <button
                  type="button"
                  className="ahome-link-btn"
                  onClick={loadRecruiters}
                  disabled={loadingRecruiters}
                >
                  {loadingRecruiters ? "Refreshing..." : "↻ Refresh"}
                </button>

                {totalRecruiters > 0 && (
                  <button
                    type="button"
                    className="ahome-link-btn"
                    onClick={() => navigate("/admin/recruiters")}
                  >
                    View all →
                  </button>
                )}

              </div>
            </div>

            {shownRecruiters.length === 0 ? (
              <div className="ahome-empty">
                <p>
                  {loadingRecruiters
                    ? "Loading recruiter accounts..."
                    : "No recruiter accounts have been created yet."}
                </p>

                {!loadingRecruiters && (
                  <button
                    type="button"
                    className="ahome-secondary-btn"
                    onClick={() => navigate("/admin/create-recruiter")}
                  >
                    Create the first recruiter
                  </button>
                )}
              </div>
            ) : (
              <ul className="ahome-application-list">
                {shownRecruiters.map((recruiter, index) => (
                  <li
                    className="ahome-application-item"
                    key={recruiter.userUuid || recruiter.email || index}
                  >

                    <div className="ahome-application-avatar">
                      {String(recruiter.name || "R").charAt(0).toUpperCase()}
                    </div>

                    <div className="ahome-application-info">
                      <strong>{recruiter.name || "Recruiter"}</strong>

                      <span>
                        {[
                          recruiter.designation,
                          recruiter.companyName,
                          recruiter.email,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>

                    <span
                      className={
                        recruiter.emailVerified === true
                          ? "ahome-status ahome-status-success"
                          : "ahome-status ahome-status-pending"
                      }
                    >
                      <span className="ahome-status-dot"></span>

                      {recruiter.emailVerified === true
                        ? "Verified"
                        : "Pending"}
                    </span>

                  </li>
                ))}
              </ul>
            )}

          </section>

        </div>

        {/* ---------- RIGHT COLUMN ---------- */}
        <aside className="ahome-side">

          {/* Verification progress */}
          <section className="ahome-card">

            <div className="ahome-card-header">
              <div>
                <h2>Verification</h2>
                <p>Recruiters with a verified email</p>
              </div>

              <strong className="ahome-percent">{verifiedPercent}%</strong>
            </div>

            <div
              className="ahome-progress"
              role="progressbar"
              aria-valuenow={verifiedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="ahome-progress-fill"
                style={{ width: `${verifiedPercent}%` }}
              ></div>
            </div>

            <p className="ahome-progress-note">
              {verifiedRecruiters} of {totalRecruiters} verified
            </p>

          </section>

          {/* Recruiters by industry */}
          {industries.length > 0 && (
            <section className="ahome-card">

              <div className="ahome-card-header">
                <div>
                  <h2>By Industry</h2>
                  <p>Where your recruiters work</p>
                </div>
              </div>

              <ul className="ahome-pipeline">
                {industries.map(([industry, count]) => (
                  <li key={industry} className="ahome-pipeline-row">

                    <div className="ahome-pipeline-label">
                      <span>{industry}</span>

                      <strong>{count}</strong>
                    </div>

                    <div className="ahome-pipeline-track">
                      <div
                        className="ahome-pipeline-fill submitted"
                        style={{
                          width: `${Math.round(
                            (count / totalRecruiters) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>

                  </li>
                ))}
              </ul>

            </section>
          )}

        </aside>

      </div>

    </div>
  );
}

export default AdminDashboard;