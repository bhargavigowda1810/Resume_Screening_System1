import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";

/* =========================================================
   CONSTANTS
   ========================================================= */

const MIN_PASSWORD_LENGTH = 6;

/* =========================================================
   SMALL REUSABLE COMPONENTS
   ========================================================= */

// Shows an error or success message
function StatusMessage({ type, children }) {
  const isError = type === "error";

  return (
    <div
      className={
        isError
          ? "reset-alert reset-alert-error"
          : "reset-alert reset-alert-success"
      }
      role={isError ? "alert" : "status"}
    >
      <span className="reset-alert-icon">{isError ? "!" : "✓"}</span>

      <span>{children}</span>
    </div>
  );
}

// Password input with a Show / Hide button
function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
  hint,
}) {
  return (
    <div className="reset-field">
      <label htmlFor={id}>{label}</label>

      <div className="reset-input-wrapper">
        <span className="reset-input-icon">•</span>

        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          disabled={disabled}
        />

        <button
          type="button"
          className="reset-show-button"
          onClick={onToggle}
          disabled={disabled}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {hint && <small className="reset-hint">{hint}</small>}
    </div>
  );
}

/* =========================================================
   RESET PASSWORD PAGE
   ========================================================= */

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  /* =========================================================
     RESET PASSWORD
     ========================================================= */

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
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
      );
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

  /* =========================================================
     UI
     ========================================================= */

  const passwordsMatch = password === confirmPassword;

  return (
    <div className="reset-page">
      <section className="reset-panel">
        <div className="reset-card">

          {/* ---------- Logo ---------- */}
          <div className="reset-logo">RS</div>

          {/* ---------- Header ---------- */}
          <div className="reset-header">
            <span className="reset-eyebrow">ACCOUNT SECURITY</span>

            <h2>Reset Password</h2>

            <p>Enter a new password for your account.</p>
          </div>

          {/* ---------- Form ---------- */}
          <form className="reset-form" onSubmit={handleSubmit}>

            <PasswordField
              id="reset-password"
              label="New password"
              placeholder="Enter new password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              visible={showPassword}
              onToggle={() => setShowPassword((previous) => !previous)}
              disabled={loading}
              hint={`Use at least ${MIN_PASSWORD_LENGTH} characters.`}
            />

            <PasswordField
              id="reset-confirm-password"
              label="Confirm password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              visible={showConfirmPassword}
              onToggle={() =>
                setShowConfirmPassword((previous) => !previous)
              }
              disabled={loading}
            />

            {/* ----- Password match indicator ----- */}
            {password && confirmPassword && (
              <div
                className={
                  passwordsMatch
                    ? "reset-match reset-match-success"
                    : "reset-match reset-match-error"
                }
              >
                <span>{passwordsMatch ? "✓" : "!"}</span>

                <span>
                  {passwordsMatch
                    ? "Passwords match."
                    : "Passwords do not match."}
                </span>
              </div>
            )}

            {/* ----- Messages ----- */}
            {error && <StatusMessage type="error">{error}</StatusMessage>}

            {message && (
              <StatusMessage type="success">{message}</StatusMessage>
            )}

            {/* ----- Submit ----- */}
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
                  <span>→</span>
                </>
              )}
            </button>

          </form>

          {/* ---------- Footer ---------- */}
          <div className="reset-footer">
            <span>Remember your password?</span>

            <Link to="/login">Back to Login</Link>
          </div>

        </div>
      </section>
    </div>
  );
}

export default ResetPassword;