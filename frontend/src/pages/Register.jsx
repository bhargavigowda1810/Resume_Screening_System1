import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("APPLICANT");

  // Show / Hide password
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/users/register", {
        name,
        email,
        password,
        role,
      });

      console.log("Registration successful:", response);

      setSuccess(
        "Registration successful! Redirecting to login..."
      );

      setName("");
      setEmail("");
      setPassword("");
      setRole("APPLICANT");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* =====================================================
          LEFT BRANDING SECTION
          ===================================================== */}

      <section className="register-brand-section">

        <div className="register-brand-decoration register-decoration-one"></div>
        <div className="register-brand-decoration register-decoration-two"></div>

        <div className="register-brand-content">

          <div className="register-logo">
            RS
          </div>

          <span className="register-brand-label">
            RESUME SCREENING SYSTEM
          </span>

          <h1>
            Start your
            <br />
            <span>journey today.</span>
          </h1>

          <p className="register-brand-description">
            Create your account and experience a smarter way
            to connect applicants with opportunities and help
            recruiters discover the right candidates.
          </p>

          <div className="register-feature-list">

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Smart Resume Screening
                </strong>

                <span>
                  Evaluate resumes efficiently with intelligent screening.
                </span>
              </div>

            </div>

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Better Job Matching
                </strong>

                <span>
                  Connect skills and opportunities more effectively.
                </span>
              </div>

            </div>

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Simple Recruitment Process
                </strong>

                <span>
                  Manage jobs, resumes, and applications in one place.
                </span>
              </div>

            </div>

          </div>

        </div>

        <div className="register-brand-footer">
          Resume Screening & Ranking System
        </div>

      </section>


      {/* =====================================================
          RIGHT REGISTRATION SECTION
          ===================================================== */}

      <section className="register-form-section">

        <div className="register-card">

          {/* Mobile logo */}
          <div className="register-mobile-logo">
            RS
          </div>

          {/* Header */}
          <div className="register-header">

            <span className="register-eyebrow">
              GET STARTED
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Enter your details to create your
              Resume Screening System account.
            </p>

          </div>


          {/* Form */}
          <form
            className="register-form"
            onSubmit={handleRegister}
          >

            {/* =================================================
                NAME
                ================================================= */}

            <div className="register-field">

              <label htmlFor="register-name">
                Full Name
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  ◉
                </span>

                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* =================================================
                EMAIL
                ================================================= */}

            <div className="register-field">

              <label htmlFor="register-email">
                Email Address
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  @
                </span>

                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* =================================================
                PASSWORD
                ================================================= */}

            <div className="register-field">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="register-password-wrapper">

                <span className="register-input-icon">
                  •
                </span>

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* =================================================
                ROLE
                ================================================= */}

            <div className="register-field">

              <label>
                Account Type
              </label>

              <div className="register-role-grid">

                <button
                  type="button"
                  className={`register-role-option ${
                    role === "APPLICANT"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setRole("APPLICANT")
                  }
                >

                  <span className="register-role-icon">
                    👤
                  </span>

                  <span className="register-role-text">
                    <strong>
                      Applicant
                    </strong>

                    <small>
                      Apply for jobs
                    </small>
                  </span>

                  <span className="register-role-check">
                    {role === "APPLICANT" ? "✓" : ""}
                  </span>

                </button>


                <button
                  type="button"
                  className={`register-role-option ${
                    role === "RECRUITER"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setRole("RECRUITER")
                  }
                >

                  <span className="register-role-icon">
                    💼
                  </span>

                  <span className="register-role-text">
                    <strong>
                      Recruiter
                    </strong>

                    <small>
                      Manage candidates
                    </small>
                  </span>

                  <span className="register-role-check">
                    {role === "RECRUITER" ? "✓" : ""}
                  </span>

                </button>

              </div>

              <small className="register-field-help">
                Choose the account type you want to create.
              </small>

            </div>


            {/* =================================================
                ERROR
                ================================================= */}

            {error && (
              <div className="register-alert register-alert-error">

                <span className="register-alert-icon">
                  !
                </span>

                <p>
                  {error}
                </p>

              </div>
            )}


            {/* =================================================
                SUCCESS
                ================================================= */}

            {success && (
              <div className="register-alert register-alert-success">

                <span className="register-alert-icon">
                  ✓
                </span>

                <p>
                  {success}
                </p>

              </div>
            )}


            {/* =================================================
                SUBMIT
                ================================================= */}

            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="register-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span>→</span>
                </>
              )}

            </button>

          </form>


          {/* =================================================
              LOGIN LINK
              ================================================= */}

          <div className="register-login-section">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>

          </div>

          <div className="register-security-note">
            Your account information is securely protected.
          </div>

        </div>

      </section>

    </div>
  );
}

export default Register;

