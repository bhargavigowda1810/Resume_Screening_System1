import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

/* =========================================================
   HELPERS
   ========================================================= */

const SESSION_KEYS = ["token", "userUuid", "role", "name", "email"];

// Adds https:// when the website was saved without a protocol
const getWebsiteUrl = (website) => {
  const value = String(website || "").trim();

  if (!value) {
    return "";
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

/* =========================================================
   SMALL REUSABLE COMPONENT
   One label + value pair
   ========================================================= */

function ProfileField({ label, children, wide }) {
  return (
    <div
      className={
        wide
          ? "recruiter-profile-field recruiter-profile-field-wide"
          : "recruiter-profile-field"
      }
    >
      <span>{label}</span>

      <strong>{children}</strong>
    </div>
  );
}

/* =========================================================
   RECRUITER PROFILE PAGE
   ========================================================= */

function MyProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- Load the logged-in recruiter ---------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Authentication is handled by the server-side session.
        // Do NOT read the user from localStorage.
        const response = await api.get("/users/me");

        if (!response?.userUuid) {
          setError(
            "Recruiter information could not be found. Please login again."
          );
          return;
        }

        setUser(response);
      } catch (error) {
        console.error("Failed to load recruiter profile:", error);

        setError(
          error?.message ||
            "Recruiter information could not be found. Please login again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ---------- Logout ---------- */
  const handleLogout = async () => {
    try {
      await api.post("/users/logout", {});
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // JWT authentication is stateless,
      // so remove the stored authentication data.
      SESSION_KEYS.forEach((key) => localStorage.removeItem(key));

      navigate("/login", { replace: true });
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="recruiter-profile-page recruiter-profile-state-page">
        <div className="recruiter-profile-state-card">
          <div className="recruiter-profile-state-icon">👤</div>

          <h2>Loading Profile</h2>

          <p>Please wait while we load your recruiter information.</p>
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error || !user) {
    return (
      <div className="recruiter-profile-page recruiter-profile-state-page">
        <div className="recruiter-profile-state-card">
          <div className="recruiter-profile-state-icon">👤</div>

          <h2>Profile Not Found</h2>

          <p>
            {error ||
              "Recruiter information could not be found. Please login again."}
          </p>

          <button
            type="button"
            className="recruiter-profile-primary-button"
            onClick={() => navigate("/login", { replace: true })}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const websiteUrl = getWebsiteUrl(user.companyWebsite);

  /* ---------- Page ---------- */
  return (
    <div className="recruiter-profile-page">

      <div className="recruiter-profile-container">

        {/* =================================================
            HEADER
            ================================================= */}

        <header className="recruiter-profile-header">

          <div className="recruiter-profile-heading">

            <span className="recruiter-profile-eyebrow">
              RECRUITER WORKSPACE
            </span>

            <h1>Profile</h1>

            <p>View your recruiter account information.</p>

          </div>
        </header>

        {/* =================================================
            PROFILE HERO
            ================================================= */}

        <section className="recruiter-profile-hero">

          <div className="recruiter-profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "R"}
          </div>

          <div className="recruiter-profile-identity">

            <h2>{user.name || "Recruiter"}</h2>

            <p>{user.email || "Email not available"}</p>

            <div className="recruiter-profile-badges">

              <span className="recruiter-profile-role-badge">
                RECRUITER
              </span>

              <span className="recruiter-profile-active-badge">
                <span className="recruiter-profile-active-dot"></span>
                Active Account
              </span>

            </div>

          </div>

        </section>

        {/* =================================================
            ACCOUNT INFORMATION
            ================================================= */}

        <section className="recruiter-profile-information">

          <div className="recruiter-profile-section-heading">

            <div className="recruiter-profile-section-icon">👤</div>

            <div>
              <h3>Account Information</h3>

              <p>Your registered recruiter account details.</p>
            </div>

          </div>

          <div className="recruiter-profile-grid">

            <ProfileField label="PHONE NUMBER">
              {user.phone || "Not available"}
            </ProfileField>

            <ProfileField label="DESIGNATION">
              {user.designation || "Not available"}
            </ProfileField>

            <ProfileField label="ACCOUNT ROLE">
              {user.role || "RECRUITER"}
            </ProfileField>

            <ProfileField label="EMAIL STATUS">
              <span
                className={
                  user.emailVerified
                    ? "recruiter-profile-pill recruiter-profile-pill-verified"
                    : "recruiter-profile-pill recruiter-profile-pill-unverified"
                }
              >
                {user.emailVerified ? "✓ Verified" : "Not Verified"}
              </span>
            </ProfileField>

          </div>

        </section>

        {/* =================================================
            COMPANY INFORMATION (includes the address)
            ================================================= */}

        <section className="recruiter-profile-information">

          <div className="recruiter-profile-section-heading">

            <div className="recruiter-profile-section-icon">🏢</div>

            <div>
              <h3>Company Information</h3>

              <p>Company details provided by the administrator.</p>
            </div>

          </div>

          <div className="recruiter-profile-grid">

            <ProfileField label="COMPANY NAME">
              {user.companyName || "Not available"}
            </ProfileField>

            <ProfileField label="COMPANY EMAIL">
              {user.companyEmail || "Not available"}
            </ProfileField>

            <ProfileField label="COMPANY PHONE">
              {user.companyPhone || "Not available"}
            </ProfileField>

            <ProfileField label="INDUSTRY">
              {user.industry || "Not available"}
            </ProfileField>

            <ProfileField label="COMPANY SIZE">
              {user.companySize || "Not available"}
            </ProfileField>

            <ProfileField label="COMPANY WEBSITE">
              {websiteUrl ? (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.companyWebsite}
                </a>
              ) : (
                "Not available"
              )}
            </ProfileField>

            <ProfileField label="ADDRESS" wide>
              {user.companyAddress || "Not available"}
            </ProfileField>

          </div>

        </section>

        {/* =================================================
            ACTIONS
            ================================================= */}

        <div className="recruiter-profile-actions">

          <button
            type="button"
            className="recruiter-profile-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default MyProfile;