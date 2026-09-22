import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { api } from "../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // Check token
    if (!token) {
      setError("Invalid or missing password reset token.");
      return;
    }

    // Check password fields
    if (!password || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Send token and new password to Spring Boot
      await api.post("/users/reset-password", {
        token: token,
        newPassword: password,
      });

      setMessage("Password reset successfully.");

      // Clear password fields
      setPassword("");
      setConfirmPassword("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Password reset failed:", error);

      setError(
        error.message ||
          "Unable to reset password. The reset link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">

      {/* =====================================================
          LEFT BRANDING PANEL
          ===================================================== */}
      <div className="reset-brand-panel">

        <div className="reset-brand-content">

          <div className="reset-brand-logo">
            RS
          </div>

          <span className="reset-brand-eyebrow">
            RESUME SCREENING SYSTEM
          </span>

          <h1>
            Securely reset
            <br />
            your password.
          </h1>

          <p>
            Create a new password and get back to
            your account securely.
          </p>

          <div className="reset-security-points">

            <div className="reset-security-item">
              <span className="reset-security-icon">
                ✓
              </span>
              <div>
                <strong>Secure Account</strong>
                <small>
                  Protect your account with a new password.
                </small>
              </div>
            </div>

            <div className="reset-security-item">
              <span className="reset-security-icon">
                ✓
              </span>
              <div>
                <strong>Quick Recovery</strong>
                <small>
                  Reset your password and continue using
                  the platform.
                </small>
              </div>
            </div>

          </div>

        </div>

        <div className="reset-decoration reset-decoration-one"></div>
        <div className="reset-decoration reset-decoration-two"></div>
        <div className="reset-decoration reset-decoration-three"></div>

      </div>


      {/* =====================================================
          RIGHT RESET PANEL
          ===================================================== */}
      <div className="reset-form-panel">

        <div className="reset-form-container">

          {/* Mobile Logo */}
          <div className="reset-mobile-logo">
            RS
          </div>

          {/* Header */}
          <div className="reset-header">

            <div className="reset-icon-box">
              🔐
            </div>

            <span className="reset-eyebrow">
              ACCOUNT SECURITY
            </span>

            <h2>
              Reset Password
            </h2>

            <p>
              Enter a new password for your account.
            </p>

          </div>


          {/* Form */}
          <form
            className="reset-form"
            onSubmit={handleSubmit}
          >

            {/* =================================================
                NEW PASSWORD
                ================================================= */}
            <div className="reset-field-group">

              <label htmlFor="reset-password">
                New Password
              </label>

              <div className="reset-input-wrapper">

                <span className="reset-input-icon">
                  🔒
                </span>

                <input
                  id="reset-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="reset-show-button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

              <small>
                Use at least 6 characters.
              </small>

            </div>


            {/* =================================================
                CONFIRM PASSWORD
                ================================================= */}
            <div className="reset-field-group">

              <label htmlFor="reset-confirm-password">
                Confirm Password
              </label>

              <div className="reset-input-wrapper">

                <span className="reset-input-icon">
                  🔒
                </span>

                <input
                  id="reset-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="reset-show-button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  disabled={loading}
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* =================================================
                PASSWORD MATCH INDICATOR
                ================================================= */}
            {password &&
              confirmPassword && (
                <div
                  className={
                    password === confirmPassword
                      ? "reset-match success"
                      : "reset-match error"
                  }
                >
                  <span>
                    {password === confirmPassword
                      ? "✓"
                      : "!"}
                  </span>

                  <p>
                    {password === confirmPassword
                      ? "Passwords match."
                      : "Passwords do not match."}
                  </p>
                </div>
              )}


            {/* =================================================
                ERROR MESSAGE
                ================================================= */}
            {error && (
              <div className="reset-alert reset-alert-error">

                <span className="reset-alert-icon">
                  !
                </span>

                <p>
                  {error}
                </p>

              </div>
            )}


            {/* =================================================
                SUCCESS MESSAGE
                ================================================= */}
            {message && (
              <div className="reset-alert reset-alert-success">

                <span className="reset-alert-icon">
                  ✓
                </span>

                <p>
                  {message}
                </p>

              </div>
            )}


            {/* =================================================
                RESET BUTTON
                ================================================= */}
            <button
              type="submit"
              className="reset-submit-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="reset-spinner"></span>
                  Resetting Password...
                </>
              ) : (
                <>
                  Reset Password
                  <span className="reset-button-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>


          {/* =================================================
              FOOTER
              ================================================= */}
          <div className="reset-footer">

            <span>
              Remember your password?
            </span>

            <Link to="/login">
              Back to Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;

