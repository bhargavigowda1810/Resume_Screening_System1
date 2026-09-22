import { useNavigate } from "react-router-dom";

function RecruiterDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/recruiter/profile");
  };

  return (
    <div className="recruiter-dashboard">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}
      <aside className="recruiter-sidebar">

        {/* Brand */}
        <div className="recruiter-sidebar-top">

          <div className="recruiter-brand">

            <div className="recruiter-brand-logo">
              RS
            </div>

            <div>
              <h2>
                Resume Screening
              </h2>

              <p>
                Recruiter Portal
              </p>
            </div>

          </div>


          {/* Navigation */}
          <nav className="recruiter-navigation">

            {/* Dashboard */}
            <button
              type="button"
              className="recruiter-nav-button active"
            >
              <span className="recruiter-nav-icon">
                ▦
              </span>

              <span>
                Dashboard
              </span>
            </button>


            {/* My Profile */}
            <button
              type="button"
              className="recruiter-nav-button"
              onClick={handleProfile}
            >
              <span className="recruiter-nav-icon">
                👤
              </span>

              <span>
                My Profile
              </span>
            </button>


            {/* Create Job */}
            <button
              type="button"
              className="recruiter-nav-button"
              onClick={() =>
                navigate("/recruiter/create-job")
              }
            >
              <span className="recruiter-nav-icon">
                ＋
              </span>

              <span>
                Create Job
              </span>
            </button>


            {/* My Jobs */}
            <button
              type="button"
              className="recruiter-nav-button"
              onClick={() =>
                navigate("/recruiter/jobs")
              }
            >
              <span className="recruiter-nav-icon">
                💼
              </span>

              <span>
                My Jobs
              </span>
            </button>


            {/* View Applicants */}
            <button
              type="button"
              className="recruiter-nav-button"
              onClick={() =>
                navigate("/recruiter/applicants")
              }
            >
              <span className="recruiter-nav-icon">
                👥
              </span>

              <span>
                View Applicants
              </span>
            </button>

          </nav>

        </div>


        {/* Logout */}
        <button
          type="button"
          className="recruiter-logout-button"
          onClick={handleLogout}
        >
          <span>
            ↪
          </span>

          <span>
            Logout
          </span>
        </button>

      </aside>


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}
      <main className="recruiter-main">

        {/* ===================================================
            HEADER
            =================================================== */}
        <header className="recruiter-header">

          <div>

            <span className="recruiter-page-label">
              RECRUITER PORTAL
            </span>

            <h1>
              Dashboard
            </h1>

            <p>
              Manage your hiring activities from one place.
            </p>

          </div>


          {/* Recruiter information */}
          <div className="recruiter-user-box">

            <div className="recruiter-avatar">

              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "R"}

            </div>

            <div>

              <strong>
                {user.name || "Recruiter"}
              </strong>

              <span>
                Recruiter
              </span>

            </div>

          </div>

        </header>


        {/* ===================================================
            WELCOME HERO
            =================================================== */}
        <section className="recruiter-welcome">

          <div className="recruiter-welcome-content">

            <span className="recruiter-welcome-label">
              WELCOME BACK
            </span>

            <h2>
              {user.name || "Recruiter"} 👋
            </h2>

            <p>
              Manage your job openings, review applicants,
              and find the right candidates efficiently.
            </p>

            <button
              type="button"
              className="recruiter-welcome-button"
              onClick={() =>
                navigate("/recruiter/create-job")
              }
            >
              Create New Job
              <span>
                →
              </span>
            </button>

          </div>


          <div className="recruiter-welcome-visual">

            <div className="recruiter-visual-circle recruiter-circle-one">
              <span>
                💼
              </span>
            </div>

            <div className="recruiter-visual-circle recruiter-circle-two">
              <span>
                👥
              </span>
            </div>

            <div className="recruiter-visual-main">
              📊
            </div>

          </div>

        </section>


        {/* ===================================================
            QUICK ACTIONS
            =================================================== */}
        <section className="recruiter-actions-section">

          <div className="recruiter-section-heading">

            <div>
              <span>
                WORKSPACE
              </span>

              <h2>
                Recruitment Management
              </h2>
            </div>

          </div>


          <div className="recruiter-action-grid">

            {/* Create Job */}
            <button
              type="button"
              className="recruiter-action-card"
              onClick={() =>
                navigate("/recruiter/create-job")
              }
            >

              <div className="recruiter-action-icon">
                ＋
              </div>

              <div className="recruiter-action-content">

                <h3>
                  Create Job
                </h3>

                <p>
                  Create and publish a new job opening.
                </p>

              </div>

              <span className="recruiter-action-arrow">
                →
              </span>

            </button>


            {/* My Jobs */}
            <button
              type="button"
              className="recruiter-action-card"
              onClick={() =>
                navigate("/recruiter/jobs")
              }
            >

              <div className="recruiter-action-icon">
                💼
              </div>

              <div className="recruiter-action-content">

                <h3>
                  My Jobs
                </h3>

                <p>
                  View and manage your posted job openings.
                </p>

              </div>

              <span className="recruiter-action-arrow">
                →
              </span>

            </button>


            {/* View Applicants */}
            <button
              type="button"
              className="recruiter-action-card"
              onClick={() =>
                navigate("/recruiter/applicants")
              }
            >

              <div className="recruiter-action-icon">
                👥
              </div>

              <div className="recruiter-action-content">

                <h3>
                  View Applicants
                </h3>

                <p>
                  Review candidates and screen applications.
                </p>

              </div>

              <span className="recruiter-action-arrow">
                →
              </span>

            </button>


            {/* My Profile */}
            <button
              type="button"
              className="recruiter-action-card"
              onClick={handleProfile}
            >

              <div className="recruiter-action-icon">
                👤
              </div>

              <div className="recruiter-action-content">

                <h3>
                  My Profile
                </h3>

                <p>
                  View and manage your recruiter information.
                </p>

              </div>

              <span className="recruiter-action-arrow">
                →
              </span>

            </button>

          </div>

        </section>


        {/* ===================================================
            AI SCREENING INFORMATION
            =================================================== */}
        <section className="recruiter-ai-card">

          <div className="recruiter-ai-icon">
            ✨
          </div>

          <div className="recruiter-ai-content">

            <div className="recruiter-ai-heading">

              <div>
                <span>
                  SMART RECRUITMENT
                </span>

                <h3>
                  AI-Powered Screening
                </h3>
              </div>

              <div className="recruiter-ai-badge">
                AI
              </div>

            </div>

            <p>
              Review applications and use the screening system
              to compare candidates based on skills, experience,
              education, and semantic similarity. Candidates are
              ranked automatically using their final screening score.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default RecruiterDashboard;

