import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
          ? "register-alert register-alert-error"
          : "register-alert register-alert-success"
      }
      role={isError ? "alert" : "status"}
    >
      <span className="register-alert-icon">{isError ? "!" : "✓"}</span>

      <span>{children}</span>
    </div>
  );
}

/* =========================================================
   REGISTER PAGE
   ========================================================= */

function Register() {
  const navigate = useNavigate();

  /* ---------- Form fields ---------- */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* ---------- Email verification (OTP) ---------- */
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Messages that belong to the verification section
  // (shown right below the email / OTP fields)
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  /* ---------- Account creation ---------- */
  // Messages that belong to the "Create Account" button
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================================================
     HELPERS
     ========================================================= */

  const clearOtpMessages = () => {
    setOtpError("");
    setOtpSuccess("");
  };

  const clearFormMessages = () => {
    setError("");
    setSuccess("");
  };

  /* =========================================================
     EMAIL CHANGE
     If the email changes after verification,
     the verification must be done again.
     ========================================================= */

  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    setEmailVerified(false);
    setOtpSent(false);
    setOtp("");

    clearOtpMessages();
    clearFormMessages();
  };

  /* =========================================================
     SEND REGISTRATION OTP
     ========================================================= */

  const handleSendOtp = async () => {
    clearOtpMessages();
    clearFormMessages();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setOtpError("Please enter your email address.");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setOtpError("Please enter a valid email address.");
      return;
    }

    setOtpLoading(true);

    try {
      await api.post("/users/send-registration-otp", {
        email: trimmedEmail,
      });

      setOtpSent(true);
      setEmailVerified(false);
      setOtp("");

      setOtpSuccess(
        "OTP has been sent to your email address. Please check your inbox."
      );
    } catch (error) {
      console.error("Failed to send registration OTP:", error);

      setOtpError(
        error.message || "Unable to send OTP. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  /* =========================================================
     VERIFY REGISTRATION OTP
     ========================================================= */

  const handleVerifyOtp = async () => {
    clearOtpMessages();
    clearFormMessages();

    const trimmedEmail = email.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setOtpError("Please enter a valid email address.");
      return;
    }

    if (!otp.trim()) {
      setOtpError("Please enter the OTP.");
      return;
    }

    if (!OTP_REGEX.test(otp.trim())) {
      setOtpError("OTP must contain exactly 6 digits.");
      return;
    }

    setVerifyLoading(true);

    try {
      await api.post("/users/verify-registration-otp", {
        email: trimmedEmail,
        otp: otp.trim(),
      });

      setEmailVerified(true);

      setOtpSuccess(
        "Email verified successfully. You can now create your account."
      );
    } catch (error) {
      console.error("OTP verification failed:", error);

      setEmailVerified(false);

      setOtpError(
        error.message || "Invalid or expired OTP. Please try again."
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  /* =========================================================
     OTP INPUT CHANGE (digits only, max 6)
     ========================================================= */

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);

    setOtp(value);
    setOtpError("");
  };

  /* =========================================================
     REGISTER
     ========================================================= */

  const handleRegister = async (event) => {
    event.preventDefault();

    clearFormMessages();

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const trimmedEmail = email.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!emailVerified) {
      setError(
        "Please verify your email address before creating your account."
      );
      return;
    }

    if (!password.trim()) {
      setError("Please enter a password.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/register", {
        name: name.trim(),
        email: trimmedEmail,
        password,

        // Public registration is only for applicants.
        role: "APPLICANT",
      });

      setSuccess("Registration successful! Redirecting to login...");

      setName("");
      setEmail("");
      setPassword("");

      setOtp("");
      setOtpSent(false);
      setEmailVerified(false);
      clearOtpMessages();

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     BUTTON LABEL: SEND / RESEND OTP
     ========================================================= */

  const renderSendOtpLabel = () => {
    if (otpLoading) {
      return (
        <>
          <span className="register-spinner"></span>
          Sending...
        </>
      );
    }

    if (emailVerified) {
      return <>Verified ✓</>;
    }

    if (otpSent) {
      return <>Resend OTP</>;
    }

    return <>Send OTP</>;
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="register-page">
      <section className="register-panel">
        <div className="register-card">

          {/* ---------- Logo ---------- */}
          <div className="register-logo">RS</div>

          {/* ---------- Header ---------- */}
          <div className="register-header">
            <span className="register-eyebrow">GET STARTED</span>

            <h2>Create your account</h2>

            <p>
              Enter your details to create your Resume Screening System
              account.
            </p>
          </div>

          {/* ---------- Form ---------- */}
          <form className="register-form" onSubmit={handleRegister}>

            {/* ===== 1. Full name ===== */}
            <div className="register-field">
              <label htmlFor="register-name">Full name</label>

              <div className="register-input-wrapper">
                <span className="register-input-icon">◉</span>

                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            </div>

            {/* ===== 2. Email verification ===== */}
            <div className="register-verify-box">

              {/* Email + Send OTP */}
              <div className="register-field">
                <label htmlFor="register-email">Email address</label>

                <div className="register-inline-row">
                  <div className="register-input-wrapper">
                    <span className="register-input-icon">@</span>

                    <input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                  </div>

                  <button
                    type="button"
                    className={
                      emailVerified
                        ? "register-secondary-button verified"
                        : "register-secondary-button"
                    }
                    onClick={handleSendOtp}
                    disabled={otpLoading || emailVerified}
                  >
                    {renderSendOtpLabel()}
                  </button>
                </div>
              </div>

              {/* OTP + Verify */}
              {otpSent && !emailVerified && (
                <div className="register-field">
                  <label htmlFor="register-otp">
                    Email verification OTP
                  </label>

                  <div className="register-inline-row">
                    <div className="register-input-wrapper">
                      <span className="register-input-icon">#</span>

                      <input
                        id="register-otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={handleOtpChange}
                      />
                    </div>

                    <button
                      type="button"
                      className="register-secondary-button"
                      onClick={handleVerifyOtp}
                      disabled={verifyLoading || otp.length !== 6}
                    >
                      {verifyLoading ? (
                        <>
                          <span className="register-spinner"></span>
                          Verifying...
                        </>
                      ) : (
                        <>Verify OTP</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Verification messages: shown right below the fields */}
              {otpError && (
                <StatusMessage type="error">{otpError}</StatusMessage>
              )}

              {otpSuccess && (
                <StatusMessage type="success">{otpSuccess}</StatusMessage>
              )}
            </div>

            {/* ===== 3. Password ===== */}
            <div className="register-field">
              <label htmlFor="register-password">Password</label>

              <div className="register-input-wrapper register-password-wrapper">
                <span className="register-input-icon">•</span>

                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* ===== 4. Account creation messages ===== */}
            {error && <StatusMessage type="error">{error}</StatusMessage>}

            {success && (
              <StatusMessage type="success">{success}</StatusMessage>
            )}

            {/* ===== 5. Create account ===== */}
            <button
              type="submit"
              className="register-submit-button"
              disabled={loading || !emailVerified}
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

            {!emailVerified && (
              <small className="register-help">
                Please verify your email before creating your account.
              </small>
            )}
          </form>

          {/* ---------- Login link ---------- */}
          <div className="register-footer">
            <span>Already have an account?</span>

            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;