import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to read user information:", error);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="applicant-profile-page">
        <div className="applicant-profile-error">
          <div className="applicant-profile-error-icon">
            !
          </div>

          <h2>Profile Not Found</h2>

          <p>
            Your applicant information could not be found.
            Please login again.
          </p>

          <button
            type="button"
            className="applicant-profile-primary-btn"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const initial = user.name
    ? user.name.charAt(0).toUpperCase()
    : "A";

  return (
    <div className="applicant-profile-page">

      {/* =========================
          TOP HEADER
      ========================== */}

      <div className="applicant-profile-header">
        <div>
          <span className="applicant-profile-eyebrow">
            ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            Manage and view your applicant account information.
          </p>
        </div>

        <button
          type="button"
          className="applicant-profile-back-btn"
          onClick={() => navigate("/applicant")}
        >
          ← Dashboard
        </button>
      </div>


      {/* =========================
          PROFILE HERO
      ========================== */}

      <div className="applicant-profile-hero">

        <div className="applicant-profile-hero-content">

          <div className="applicant-profile-avatar">
            {initial}
          </div>

          <div className="applicant-profile-identity">

            <span className="applicant-profile-role">
              APPLICANT
            </span>

            <h2>
              {user.name || "Applicant"}
            </h2>

            <p>
              {user.email || "Email not available"}
            </p>

          </div>

        </div>

        <div className="applicant-profile-active-badge">
          <span className="applicant-profile-active-dot"></span>
          Active Account
        </div>

      </div>


      {/* =========================
          MAIN CONTENT
      ========================== */}

      <div className="applicant-profile-content">

        {/* Account Information */}

        <section className="applicant-profile-card">

          <div className="applicant-profile-card-header">

            <div className="applicant-profile-section-icon">
              👤
            </div>

            <div>
              <h3>Account Information</h3>

              <p>
                Your registered account details
              </p>
            </div>

          </div>


          <div className="applicant-profile-grid">

            <div className="applicant-profile-field">
              <span>Full Name</span>

              <strong>
                {user.name || "Not available"}
              </strong>
            </div>


            <div className="applicant-profile-field">
              <span>Email Address</span>

              <strong>
                {user.email || "Not available"}
              </strong>
            </div>


            {/*<div className="applicant-profile-field">
              <span>User ID</span>

              <strong>
                {user.userId || "Not available"}
              </strong>
            </div>*/}

            <div className="applicant-profile-field">
              <span>Account Role</span>

              <strong>
                {user.role || "APPLICANT"}
              </strong>
            </div>

          </div>

        </section>


        {/* Account Status */}

        <section className="applicant-profile-status-card">

          <div className="applicant-profile-status-icon">
            ✓
          </div>

          <div className="applicant-profile-status-content">

            <div>
              <span className="applicant-profile-status-label">
                ACCOUNT STATUS
              </span>

              <h3>
                Account Active
              </h3>
            </div>

            <p>
              Your applicant account is currently active
              and available for job applications.
            </p>

          </div>

        </section>


        {/* Profile Actions */}

        <div className="applicant-profile-actions">

          <button
            type="button"
            className="applicant-profile-secondary-btn"
            onClick={() => navigate("/applicant")}
          >
            ← Back to Dashboard
          </button>

          <button
            type="button"
            className="applicant-profile-primary-btn"
            onClick={() => navigate("/applicant/jobs")}
          >
            Browse Jobs →
          </button>

        </div>

      </div>

    </div>
  );
}

export default MyProfile;

