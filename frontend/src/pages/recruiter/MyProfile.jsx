import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="recruiter-profile-page recruiter-profile-state-page">
        <div className="recruiter-profile-state-card">
          <div className="recruiter-profile-state-icon">
            👤
          </div>

          <h2>Profile Not Found</h2>

          <p>
            Recruiter information could not be found.
            Please login again.
          </p>

          <button
            type="button"
            className="recruiter-profile-primary-button"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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

            <h1>
              My Profile
            </h1>

            <p>
              View and manage your recruiter account information.
            </p>

          </div>

          <button
            type="button"
            className="recruiter-profile-back-button"
            onClick={() => navigate("/recruiter")}
          >
            <span>←</span>
            Dashboard
          </button>

        </header>


        {/* =================================================
            PROFILE CARD
            ================================================= */}

        <main className="recruiter-profile-card">

          {/* Profile Hero */}

          <section className="recruiter-profile-hero">

            <div className="recruiter-profile-avatar">

              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "R"}

            </div>

            <div className="recruiter-profile-identity">

              <h2>
                {user.name || "Recruiter"}
              </h2>

              <p>
                {user.email || "Email not available"}
              </p>

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

              <div className="recruiter-profile-section-icon">
                👤
              </div>

              <div>
                <h3>
                  Account Information
                </h3>

                <p>
                  Your registered recruiter account details.
                </p>
              </div>

            </div>


            <div className="recruiter-profile-grid">

              <div className="recruiter-profile-field">

                <span>
                  FULL NAME
                </span>

                <strong>
                  {user.name || "Not available"}
                </strong>

              </div>


              <div className="recruiter-profile-field">

                <span>
                  EMAIL ADDRESS
                </span>

                <strong>
                  {user.email || "Not available"}
                </strong>

              </div>


              {/*<div className="recruiter-profile-field">

                <span>
                  USER ID
                </span>

                <strong>
                  {user.userId || "Not available"}
                </strong>

              </div>*/}


              <div className="recruiter-profile-field">

                <span>
                  ACCOUNT ROLE
                </span>

                <strong>
                  {user.role || "RECRUITER"}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              ACCOUNT STATUS
              ================================================= */}

          <section className="recruiter-profile-status">

            <div className="recruiter-profile-status-icon">
              ✓
            </div>

            <div className="recruiter-profile-status-content">

              <strong>
                Account Active
              </strong>

              <p>
                Your recruiter account is currently active
                and ready to manage job postings and applicants.
              </p>

            </div>

          </section>


          {/* =================================================
              ACTIONS
              ================================================= */}

          <div className="recruiter-profile-actions">

            <button
              type="button"
              className="recruiter-profile-secondary-button"
              onClick={() => navigate("/recruiter")}
            >
              ← Back to Dashboard
            </button>

            <button
              type="button"
              className="recruiter-profile-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </main>

      </div>

    </div>
  );
}

export default MyProfile;

