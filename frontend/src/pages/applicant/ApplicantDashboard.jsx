import { useNavigate } from "react-router-dom";

function ApplicantDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="applicant-dashboard">
      {/* ==================== SIDEBAR ==================== */}
      <aside className="applicant-sidebar">
        <div className="sidebar-top">
          {/* Logo */}
          <div className="brand">
            <div className="brand-logo">RS</div>

            <div className="brand-text">
              <h2>ResumeScreen</h2>
              <span>Applicant Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sidebar-navigation">
            <button
              type="button"
              className="sidebar-nav-item active"
            >
              <span className="nav-icon">▦</span>
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className="sidebar-nav-item"
              onClick={() => navigate("/applicant/profile")}
            >
              <span className="nav-icon">👤</span>
              <span>My Profile</span>
            </button>

            <button
              type="button"
              className="sidebar-nav-item"
              onClick={() => navigate("/applicant/upload-resume")}
            >
              <span className="nav-icon">📄</span>
              <span>Upload Resume</span>
            </button>

            <button
              type="button"
              className="sidebar-nav-item"
              onClick={() => navigate("/applicant/jobs")}
            >
              <span className="nav-icon">💼</span>
              <span>Available Jobs</span>
            </button>

            <button
              type="button"
              className="sidebar-nav-item"
              onClick={() => navigate("/applicant/applications")}
            >
              <span className="nav-icon">📋</span>
              <span>My Applications</span>
            </button>
          </nav>
        </div>

        {/* Logout */}
        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <span className="nav-icon">↪</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="applicant-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <span className="header-eyebrow">APPLICANT PORTAL</span>

            <h1>Dashboard</h1>

            <p>
              Manage your profile, resume and job applications from one place.
            </p>
          </div>

          {/* User */}
          <div className="header-user">
            <div className="header-avatar">
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "A"}
            </div>

            <div className="header-user-info">
              <strong>{user.name || "Applicant"}</strong>
              <span>Applicant</span>
            </div>
          </div>
        </header>

        {/* ==================== WELCOME HERO ==================== */}
        <section className="welcome-hero">
          <div className="welcome-content">
            <span className="welcome-badge">
              ✨ Welcome back
            </span>

            <h2>
              Hello, {user.name || "Applicant"}!
            </h2>

            <p>
              Discover opportunities that match your skills and take
              the next step toward your career goals.
            </p>

            <div className="welcome-actions">
              <button
                type="button"
                className="primary-action"
                onClick={() => navigate("/applicant/jobs")}
              >
                Explore Jobs
                <span>→</span>
              </button>

              <button
                type="button"
                className="secondary-action"
                onClick={() => navigate("/applicant/upload-resume")}
              >
                Upload Resume
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-circle hero-circle-one"></div>
            <div className="hero-circle hero-circle-two"></div>

            <div className="hero-briefcase">
              💼
            </div>

            <div className="floating-card floating-card-top">
              <span className="floating-icon">✓</span>
              <div>
                <strong>Career Ready</strong>
                <small>Build your profile</small>
              </div>
            </div>

            <div className="floating-card floating-card-bottom">
              <span className="floating-icon">★</span>
              <div>
                <strong>Find Opportunities</strong>
                <small>Explore new jobs</small>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== QUICK ACTIONS ==================== */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">GET STARTED</span>
              <h2>Quick Actions</h2>
            </div>

            <p>
              Everything you need for your job search
            </p>
          </div>

          <div className="action-grid">
            {/* Profile */}
            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/applicant/profile")}
            >
              <div className="action-card-top">
                <div className="action-icon profile-icon">
                  👤
                </div>

                <span className="action-arrow">↗</span>
              </div>

              <div className="action-card-content">
                <h3>My Profile</h3>

                <p>
                  View and manage your personal information and profile
                  details.
                </p>
              </div>

              <span className="action-link">
                View Profile →
              </span>
            </button>

            {/* Upload Resume */}
            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/applicant/upload-resume")}
            >
              <div className="action-card-top">
                <div className="action-icon resume-icon">
                  📄
                </div>

                <span className="action-arrow">↗</span>
              </div>

              <div className="action-card-content">
                <h3>Upload Resume</h3>

                <p>
                  Upload your latest resume and keep your application
                  information up to date.
                </p>
              </div>

              <span className="action-link">
                Upload Resume →
              </span>
            </button>

            {/* Available Jobs */}
            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/applicant/jobs")}
            >
              <div className="action-card-top">
                <div className="action-icon jobs-icon">
                  💼
                </div>

                <span className="action-arrow">↗</span>
              </div>

              <div className="action-card-content">
                <h3>Available Jobs</h3>

                <p>
                  Explore available opportunities and find jobs that
                  match your skills.
                </p>
              </div>

              <span className="action-link">
                Browse Jobs →
              </span>
            </button>

            {/* Applications */}
            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/applicant/applications")}
            >
              <div className="action-card-top">
                <div className="action-icon application-icon">
                  📋
                </div>

                <span className="action-arrow">↗</span>
              </div>

              <div className="action-card-content">
                <h3>My Applications</h3>

                <p>
                  Track your submitted applications and monitor your
                  job search progress.
                </p>
              </div>

              <span className="action-link">
                View Applications →
              </span>
            </button>
          </div>
        </section>

        {/* ==================== GETTING STARTED ==================== */}
        <section className="getting-started">
          <div className="getting-icon">
            ✨
          </div>

          <div className="getting-content">
            <span className="section-eyebrow">
              YOUR NEXT STEP
            </span>

            <h2>Make your profile stand out</h2>

            <p>
              Complete your profile and upload your latest resume before
              applying for jobs. Our screening system evaluates your
              resume against job requirements to help identify relevant
              opportunities.
            </p>
          </div>

          <button
            type="button"
            className="getting-button"
            onClick={() => navigate("/applicant/profile")}
          >
            Complete Profile →
          </button>
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <span>ResumeScreen Applicant Portal</span>
          <span>Find opportunities. Build your career.</span>
        </footer>
      </main>
    </div>
  );
}

export default ApplicantDashboard;

