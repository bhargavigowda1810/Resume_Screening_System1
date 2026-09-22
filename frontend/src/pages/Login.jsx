import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!loginType) {
      setError("Please select Applicant or Recruiter.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email,
        password,
      });

      // Check selected login type against actual account role
      if (
        loginType === "APPLICANT" &&
        response.role !== "APPLICANT"
      ) {
        setError("This account is not an Applicant account.");
        return;
      }

      if (
        loginType === "RECRUITER" &&
        response.role !== "RECRUITER"
      ) {
        setError("This account is not a Recruiter account.");
        return;
      }

      // Save logged-in user
      localStorage.setItem("user", JSON.stringify(response));

      // Redirect based on role
      if (response.role === "APPLICANT") {
        navigate("/applicant");
      } else if (response.role === "RECRUITER") {
        navigate("/recruiter");
      } else {
        setError("Unknown user role.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const resetLoginType = () => {
    setLoginType("");
    setEmail("");
    setPassword("");
    setError("");
    setShowPassword(false);
  };

  return (
    <div className="login-page">

      {/* Left branding section */}
      <section className="login-brand">

        <div className="login-brand-overlay"></div>

        <div className="login-brand-content">

          <div className="login-logo">
            RS
          </div>

          <div className="login-brand-label">
            RESUME SCREENING SYSTEM
          </div>

          <h1>
            Find the right
            <br />
            <span>Job and candidate faster.</span>
          </h1>

          <p className="login-brand-description">
            A smarter way to screen resumes, discover qualified
            candidates, and simplify the recruitment process.
          </p>

          <div className="login-features">

            <div className="login-feature">
              <div className="login-feature-icon">✓</div>
              <div>
                <strong>AI-powered screening</strong>
                <span>Analyze resumes intelligently</span>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">✓</div>
              <div>
                <strong>Smart candidate ranking</strong>
                <span>Find the most relevant candidates</span>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">✓</div>
              <div>
                <strong>Faster hiring decisions</strong>
                <span>Reduce manual screening effort</span>
              </div>
            </div>

          </div>

        </div>

        <div className="login-brand-footer">
          Resume Screening & Ranking System
        </div>

      </section>

      {/* Login section */}
      <section className="login-panel">

        <div className="login-card">

          {/* Mobile logo */}
          <div className="login-mobile-logo">
            RS
          </div>

          <div className="login-heading">

            <span className="login-eyebrow">
              ACCOUNT ACCESS
            </span>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue to your account
            </p>

          </div>

          {/* Login type selection */}
          {!loginType && (
            <div className="login-role-selection">

              <div className="login-section-label">
                Continue as
              </div>

              <div className="login-role-grid">

                <button
                  type="button"
                  className="login-role-card"
                  onClick={() => setLoginType("APPLICANT")}
                >
                  <div className="login-role-icon applicant-icon">
                    👤
                  </div>

                  <div className="login-role-content">
                    <strong>Applicant</strong>
                    <span>Search and apply for jobs</span>
                  </div>

                  <div className="login-role-arrow">
                    →
                  </div>
                </button>

                <button
                  type="button"
                  className="login-role-card"
                  onClick={() => setLoginType("RECRUITER")}
                >
                  <div className="login-role-icon recruiter-icon">
                    💼
                  </div>

                  <div className="login-role-content">
                    <strong>Recruiter</strong>
                    <span>Manage jobs and candidates</span>
                  </div>

                  <div className="login-role-arrow">
                    →
                  </div>
                </button>

              </div>

            </div>
          )}

          {/* Login form */}
          {loginType && (
            <div className="login-form-section">

              {/* Selected role */}
              <div className="login-selected-role">

                <div className="login-selected-role-info">

                  <div className="login-selected-role-icon">
                    {loginType === "APPLICANT" ? "👤" : "💼"}
                  </div>

                  <div>
                    <span>Signing in as</span>
                    <strong>
                      {loginType === "APPLICANT"
                        ? "Applicant"
                        : "Recruiter"}
                    </strong>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={resetLoginType}
                  className="login-change-role"
                >
                  Change
                </button>

              </div>

              <form onSubmit={handleLogin}>

                {/* Email */}
                <div className="login-input-group">

                  <label htmlFor="login-email">
                    Email address
                  </label>

                  <div className="login-input-wrapper">

                    <span className="login-input-icon">
                      @
                    </span>

                    <input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      required
                    />

                  </div>

                </div>

                {/* Password */}
                <div className="login-input-group">

                  <label htmlFor="login-password">
                    Password
                  </label>

                  <div className="login-password-wrapper">

                    <span className="login-input-icon">
                      •
                    </span>

                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      required
                    />

                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                </div>

                {/* Forgot password */}
                <div className="login-forgot-row">

                  <button
                    type="button"
                    className="login-forgot-button"
                    onClick={() =>
                      navigate("/forgot-password")
                    }
                  >
                    Forgot Password?
                  </button>

                </div>

                {/* Error */}
                {error && (
                  <div className="login-error">
                    <span className="login-error-icon">
                      !
                    </span>

                    <span>{error}</span>
                  </div>
                )}

                {/* Login button */}
                <button
                  type="submit"
                  className="login-submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="login-spinner"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <span>→</span>
                    </>
                  )}
                </button>

              </form>

            </div>
          )}

          {/* Register */}
          <div className="login-register">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

          <div className="login-security-note">
            Your account information is securely protected.
          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;