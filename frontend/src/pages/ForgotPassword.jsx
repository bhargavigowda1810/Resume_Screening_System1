import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      await api.post("/users/forgot-password", {
        email: email,
      });

      setMessage(
        "If an account exists with this email, " +
          "a password reset link has been sent to your email."
      );
    } catch (error) {
      console.error("Forgot password failed:", error);

      setError(
        error.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">

      {/* =====================================================
          LEFT BRANDING SECTION
          ===================================================== */}

      <section className="forgot-brand-section">

        <div className="forgot-decoration forgot-decoration-one"></div>
        <div className="forgot-decoration forgot-decoration-two"></div>

        <div className="forgot-brand-content">

          <div className="forgot-logo">
            RS
          </div>

          <span className="forgot-brand-label">
            RESUME SCREENING SYSTEM
          </span>

          <h1>
            Secure access,
            <br />
            <span>simple recovery.</span>
          </h1>

          <p className="forgot-brand-description">
            Recover access to your account securely and
            continue managing your resumes, applications,
            jobs, and candidates.
          </p>

          <div className="forgot-feature-list">

            <div className="forgot-feature">

              <div className="forgot-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Secure account recovery
                </strong>

                <span>
                  Request a password reset using your registered email.
                </span>
              </div>

            </div>

            <div className="forgot-feature">

              <div className="forgot-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Simple process
                </strong>

                <span>
                  Enter your email and follow the reset instructions.
                </span>
              </div>

            </div>

            <div className="forgot-feature">

              <div className="forgot-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Continue where you left off
                </strong>

                <span>
                  Get back to your account and continue your work.
                </span>
              </div>

            </div>

          </div>

        </div>

        <div className="forgot-brand-footer">
          Resume Screening & Ranking System
        </div>

      </section>


      {/* =====================================================
          RIGHT RECOVERY SECTION
          ===================================================== */}

      <section className="forgot-form-section">

        <div className="forgot-card">

          {/* Mobile logo */}
          <div className="forgot-mobile-logo">
            RS
          </div>

          {/* Recovery icon */}
          <div className="forgot-icon-container">
            <span>
              ↻
            </span>
          </div>

          {/* Header */}
          <div className="forgot-header">

            <span className="forgot-eyebrow">
              ACCOUNT RECOVERY
            </span>

            <h2>
              Forgot your password?
            </h2>

            <p>
              No worries. Enter your registered email address
              and we'll help you reset your password.
            </p>

          </div>


          {/* Form */}
          <form
            className="forgot-form"
            onSubmit={handleSubmit}
          >

            <div className="forgot-field">

              <label htmlFor="forgot-email">
                Email Address
              </label>

              <div className="forgot-input-wrapper">

                <span className="forgot-input-icon">
                  @
                </span>

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                  disabled={loading}
                />

              </div>

            </div>


            {/* Error */}
            {error && (
              <div className="forgot-alert forgot-alert-error">

                <span className="forgot-alert-icon">
                  !
                </span>

                <p>
                  {error}
                </p>

              </div>
            )}


            {/* Success */}
            {message && (
              <div className="forgot-alert forgot-alert-success">

                <span className="forgot-alert-icon">
                  ✓
                </span>

                <p>
                  {message}
                </p>

              </div>
            )}


            {/* Send button */}
            <button
              type="submit"
              className="forgot-submit-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="forgot-spinner"></span>
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <span>→</span>
                </>
              )}

            </button>

          </form>


          {/* Back to Login */}
          <div className="forgot-footer">

            <span>
              Remember your password?
            </span>

            <Link to="/login">
              Back to Login
            </Link>

          </div>

          <div className="forgot-security-note">
            Password recovery instructions will be sent to your
            registered email address.
          </div>

        </div>

      </section>

    </div>
  );
}

export default ForgotPassword;

