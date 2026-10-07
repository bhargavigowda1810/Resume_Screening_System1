import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

/* =========================================================
   CONSTANTS
   ========================================================= */

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const OTP_REGEX = /^\d{6}$/;

/* =========================================================
   SMALL REUSABLE COMPONENT
   Shows an error or success message
   ========================================================= */

function StatusMessage({ type, children }) {
  const isError = type === "error";

  return (
    <div
      className={
        isError
          ? "forgot-alert forgot-alert-error"
          : "forgot-alert forgot-alert-success"
      }
      role={isError ? "alert" : "status"}
    >
      <span className="forgot-alert-icon">{isError ? "!" : "✓"}</span>

      <span>{children}</span>
    </div>
  );
}

/* =========================================================
   FORGOT PASSWORD PAGE
   ========================================================= */

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  /* =========================================================
     EMAIL CHANGE
     If the user changes the email after requesting an OTP,
     the OTP verification step is reset.
     ========================================================= */

  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    setOtp("");
    setOtpSent(false);

    setMessage("");
    setError("");
  };

  /* =========================================================
     SEND PASSWORD RESET OTP
     ========================================================= */

  const handleSendOtp = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users/send-password-reset-otp", {
        email: email.trim(),
      });

      setOtpSent(true);

      setMessage(
        response.data ||
          "If an account exists with this email, " +
            "a password reset OTP has been sent."
      );
    } catch (error) {
      console.error("Password reset OTP request failed:", error);

      setError(error.message || "Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     VERIFY PASSWORD RESET OTP
     ========================================================= */

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!OTP_REGEX.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setVerifyLoading(true);

    try {
      const response = await api.post("/users/verify-password-reset-otp", {
        email: email.trim(),
        otp: otp,
      });

      // Backend returns the password reset token after successful
      // OTP verification.
      const token = response?.token;

      if (!token) {
        throw new Error("Password reset token was not received.");
      }

      // Open the existing ResetPassword page.
      // ResetPassword.jsx reads the token from the URL.
      navigate(`/reset-password?token=${encodeURIComponent(token)}`);
    } catch (error) {
      console.error("Password reset OTP verification failed:", error);

      setError(error.message || "Unable to verify OTP. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  /* =========================================================
     OTP INPUT CHANGE (digits only)
     ========================================================= */

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");

    setOtp(value);
    setError("");
    setMessage("");
  };

  /* =========================================================
     CHANGE EMAIL (go back to the first step)
     ========================================================= */

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtp("");
    setMessage("");
    setError("");
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="forgot-page">
      <section className="forgot-panel">
        <div className="forgot-card">

          {/* ---------- Logo ---------- */}
          <div className="forgot-logo">RS</div>

          {/* ---------- Header ---------- */}
          <div className="forgot-header">
            <span className="forgot-eyebrow">ACCOUNT RECOVERY</span>

            <h2>Forgot your password?</h2>

            <p>
              No worries. Verify your registered email and we'll help you
              reset your password.
            </p>
          </div>

          {/* ===================================================
              STEP 1: EMAIL FORM
              =================================================== */}

          {!otpSent && (
            <form className="forgot-form" onSubmit={handleSendOtp}>

              <div className="forgot-field">
                <label htmlFor="forgot-email">Email address</label>

                <div className="forgot-input-wrapper">
                  <span className="forgot-input-icon">@</span>

                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && <StatusMessage type="error">{error}</StatusMessage>}

              {message && (
                <StatusMessage type="success">{message}</StatusMessage>
              )}

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
                    Send OTP
                    <span>→</span>
                  </>
                )}
              </button>

            </form>
          )}

          {/* ===================================================
              STEP 2: OTP FORM
              =================================================== */}

          {otpSent && (
            <form className="forgot-form" onSubmit={handleVerifyOtp}>

              <div className="forgot-field">
                <label htmlFor="forgot-email">Email address</label>

                <div className="forgot-input-wrapper">
                  <span className="forgot-input-icon">@</span>

                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    disabled
                  />
                </div>
              </div>

              <div className="forgot-field">
                <label htmlFor="forgot-otp">Verification OTP</label>

                <div className="forgot-input-wrapper">
                  <span className="forgot-input-icon">#</span>

                  <input
                    id="forgot-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={handleOtpChange}
                    required
                    disabled={verifyLoading}
                  />
                </div>
              </div>

              {error && <StatusMessage type="error">{error}</StatusMessage>}

              {message && (
                <StatusMessage type="success">{message}</StatusMessage>
              )}

              <button
                type="submit"
                className="forgot-submit-button"
                disabled={verifyLoading || otp.length !== 6}
              >
                {verifyLoading ? (
                  <>
                    <span className="forgot-spinner"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <span>→</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="forgot-secondary-button"
                onClick={handleChangeEmail}
                disabled={verifyLoading}
              >
                Change Email
              </button>

            </form>
          )}

          {/* ---------- Footer ---------- */}
          <div className="forgot-footer">
            <span>Remember your password?</span>

            <Link to="/login">Back to Login</Link>
          </div>

          <div className="forgot-security-note">
            A verification OTP will be sent to your registered email address.
          </div>

        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;