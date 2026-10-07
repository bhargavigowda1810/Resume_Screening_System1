import { useState } from "react";
import { api } from "../../services/api";

/* =========================================================
   CONSTANTS
   ========================================================= */

const INDUSTRY_OPTIONS = [
  "Information Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Telecommunications",
  "Other",
];

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1-10 Employees" },
  { value: "11-50", label: "11-50 Employees" },
  { value: "51-200", label: "51-200 Employees" },
  { value: "201-500", label: "201-500 Employees" },
  { value: "501-1000", label: "501-1000 Employees" },
  { value: "1001-5000", label: "1001-5000 Employees" },
  { value: "5000+", label: "5000+ Employees" },
];

/* =========================================================
   SMALL REUSABLE COMPONENTS
   ========================================================= */

// Label + field wrapper
function Field({ id, label, optional, wide, children }) {
  return (
    <div
      className={
        wide
          ? "create-recruiter-field create-recruiter-field-wide"
          : "create-recruiter-field"
      }
    >
      <label htmlFor={id}>
        {label}

        {optional && (
          <span className="create-recruiter-optional">Optional</span>
        )}
      </label>

      {children}
    </div>
  );
}

// Shows an error or success message
function StatusMessage({ type, children }) {
  const isError = type === "error";

  return (
    <div
      className={
        isError
          ? "create-recruiter-alert create-recruiter-alert-error"
          : "create-recruiter-alert create-recruiter-alert-success"
      }
      role={isError ? "alert" : "status"}
    >
      <span className="create-recruiter-alert-icon">
        {isError ? "!" : "✓"}
      </span>

      <span>{children}</span>
    </div>
  );
}

/* =========================================================
   CREATE RECRUITER PAGE
   ========================================================= */

function CreateRecruiter() {
  // =========================
  // Recruiter Details
  // =========================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // =========================
  // Email Verification
  // =========================
  const [emailOtp, setEmailOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] =
    useState("");

  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Messages that belong to the email verification step
  // (shown right below the email field)
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  // =========================
  // Company Details
  // =========================
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  // =========================
  // Status of "Create Recruiter"
  // =========================
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const clearEmailMessages = () => {
    setEmailError("");
    setEmailSuccess("");
  };

  // =========================
  // Email Change
  // =========================
  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    // Changing email invalidates previous verification.
    setEmailVerified(false);
    setEmailVerificationToken("");
    setEmailOtp("");
    setOtpSent(false);

    clearEmailMessages();
    setSuccess("");
    setError("");
  };

  // =========================
  // Send Email Verification OTP
  // =========================
  const handleSendEmailVerificationOtp = async () => {
    clearEmailMessages();
    setSuccess("");
    setError("");

    if (!email.trim()) {
      setEmailError("Please enter the recruiter's email address.");
      return;
    }

    setVerifyingEmail(true);

    try {
      await api.post(
        "/users/admin/recruiters/send-email-verification-otp",
        {
          email: email.trim(),
        }
      );

      setOtpSent(true);
      setEmailVerified(false);
      setEmailVerificationToken("");
      setEmailOtp("");

      setEmailSuccess(`OTP sent successfully to ${email.trim()}.`);
    } catch (error) {
      console.error("Failed to send email verification OTP:", error);

      setEmailError(
        error?.message || "Unable to send verification OTP."
      );
    } finally {
      setVerifyingEmail(false);
    }
  };

  // =========================
  // Verify Email OTP
  // =========================
  const handleVerifyEmailOtp = async () => {
    clearEmailMessages();
    setSuccess("");
    setError("");

    if (!email.trim()) {
      setEmailError("Please enter the recruiter's email address.");
      return;
    }

    if (!emailOtp.trim()) {
      setEmailError("Please enter the OTP.");
      return;
    }

    if (emailOtp.length !== 6) {
      setEmailError("Please enter the complete 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);

    try {
      const response = await api.post(
        "/users/admin/recruiters/verify-email",
        {
          email: email.trim(),
          otp: emailOtp.trim(),
        }
      );

      if (!response?.verificationToken) {
        throw new Error(
          "Email verification token was not returned by the server."
        );
      }

      setEmailVerified(true);

      setEmailVerificationToken(response.verificationToken);

      setEmailSuccess(
        "Recruiter email verified successfully. You can now create the recruiter account."
      );
    } catch (error) {
      console.error("Failed to verify recruiter email:", error);

      setEmailVerified(false);
      setEmailVerificationToken("");

      setEmailError(error?.message || "Unable to verify recruiter email.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // =========================
  // Create Recruiter
  // =========================
  const handleCreateRecruiter = async (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (!emailVerified || !emailVerificationToken) {
      setError(
        "Please verify the recruiter's email before creating the account."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users/admin/recruiters", {
        name,
        email,
        phone,
        designation,
        password,

        companyName,
        companyEmail,
        companyPhone,
        companyWebsite,
        industry,
        companySize,
        companyAddress,

        emailVerificationToken,
      });

      setSuccess(
        `Recruiter account created successfully for ${response.name}.`
      );

      // Clear recruiter details
      setName("");
      setEmail("");
      setPhone("");
      setDesignation("");
      setPassword("");
      setShowPassword(false);

      // Clear verification
      setEmailOtp("");
      setOtpSent(false);
      setEmailVerified(false);
      setEmailVerificationToken("");
      clearEmailMessages();

      // Clear company details
      setCompanyName("");
      setCompanyEmail("");
      setCompanyPhone("");
      setCompanyWebsite("");
      setIndustry("");
      setCompanySize("");
      setCompanyAddress("");
    } catch (error) {
      console.error("Failed to create recruiter:", error);

      setError(error?.message || "Unable to create recruiter account.");
    } finally {
      setLoading(false);
    }
  };

  // The email box is locked while sending / verifying and once verified
  const emailLocked = verifyingEmail || verifyingOtp || emailVerified;

  const canCreate = emailVerified && emailVerificationToken;

  /* =========================
     UI
     ========================= */

  return (
    <div className="create-recruiter-page">

      <main className="create-recruiter-container">

        {/* ================= PAGE HEADER ================= */}

        <header className="create-recruiter-header">

          <span className="create-recruiter-eyebrow">Administration</span>

          <h1>Create Recruiter</h1>

          <p>
            Verify the recruiter's email first, then create the recruiter
            account and associate it with their company.
          </p>

        </header>

        {/* ===================== FORM ===================== */}

        <form
          className="create-recruiter-form"
          onSubmit={handleCreateRecruiter}
        >

          {/* ========== RECRUITER INFORMATION ========== */}

          <section className="create-recruiter-card">

            <div className="create-recruiter-card-header">
              <div className="create-recruiter-card-icon">👤</div>

              <div>
                <h2>Recruiter Information</h2>

                <p>Personal and login details of the recruiter.</p>
              </div>
            </div>

            <div className="create-recruiter-grid">

              {/* Full name */}
              <Field id="recruiter-name" label="Full Name">
                <input
                  id="recruiter-name"
                  className="create-recruiter-input"
                  type="text"
                  placeholder="Enter recruiter's full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </Field>

              {/* Designation */}
              <Field id="recruiter-designation" label="Designation">
                <input
                  id="recruiter-designation"
                  className="create-recruiter-input"
                  type="text"
                  placeholder="HR Manager, Talent Acquisition Specialist"
                  value={designation}
                  onChange={(event) => setDesignation(event.target.value)}
                  required
                />
              </Field>

              {/* Email + verification */}
              <Field id="recruiter-email" label="Recruiter Email" wide>

                <div className="create-recruiter-inline-row">

                  <input
                    id="recruiter-email"
                    className={
                      emailVerified
                        ? "create-recruiter-input is-verified"
                        : "create-recruiter-input"
                    }
                    type="email"
                    placeholder="Enter recruiter's email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    disabled={emailLocked}
                  />

                  <button
                    type="button"
                    className={
                      emailVerified
                        ? "create-recruiter-action-button verified"
                        : "create-recruiter-action-button"
                    }
                    onClick={handleSendEmailVerificationOtp}
                    disabled={emailLocked || !email.trim()}
                  >
                    {emailVerified
                      ? "✓ Verified"
                      : verifyingEmail
                      ? "Sending..."
                      : otpSent
                      ? "Resend OTP"
                      : "Verify Email"}
                  </button>

                </div>

                {/* OTP box */}
                {otpSent && !emailVerified && (
                  <div className="create-recruiter-otp-box">

                    <p>
                      Enter the 6-digit OTP sent to{" "}
                      <strong>{email}</strong>
                    </p>

                    <div className="create-recruiter-inline-row">

                      <input
                        className="create-recruiter-input create-recruiter-otp-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter OTP"
                        aria-label="Email verification OTP"
                        value={emailOtp}
                        onChange={(event) =>
                          setEmailOtp(event.target.value.replace(/\D/g, ""))
                        }
                      />

                      <button
                        type="button"
                        className="create-recruiter-action-button verify"
                        onClick={handleVerifyEmailOtp}
                        disabled={verifyingOtp || emailOtp.length !== 6}
                      >
                        {verifyingOtp ? "Verifying..." : "Verify OTP"}
                      </button>

                    </div>

                  </div>
                )}

                {/* Messages for this step: right below the email field */}
                {emailError && (
                  <StatusMessage type="error">{emailError}</StatusMessage>
                )}

                {emailSuccess && (
                  <StatusMessage type="success">{emailSuccess}</StatusMessage>
                )}

              </Field>

              {/* Phone */}
              <Field id="recruiter-phone" label="Phone Number">
                <input
                  id="recruiter-phone"
                  className="create-recruiter-input"
                  type="tel"
                  placeholder="Enter recruiter's phone number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                />
              </Field>

              {/* Password */}
              <Field id="recruiter-password" label="Recruiter Password">

                <div className="create-recruiter-inline-row">

                  <input
                    id="recruiter-password"
                    className="create-recruiter-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create recruiter password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                  />

                  <button
                    type="button"
                    className="create-recruiter-toggle-button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </Field>

            </div>

          </section>

          {/* ========== COMPANY INFORMATION ========== */}

          <section className="create-recruiter-card">

            <div className="create-recruiter-card-header">
              <div className="create-recruiter-card-icon">🏢</div>

              <div>
                <h2>Company Information</h2>

                <p>The company this recruiter hires for.</p>
              </div>
            </div>

            <div className="create-recruiter-grid">

              <Field id="company-name" label="Company Name">
                <input
                  id="company-name"
                  className="create-recruiter-input"
                  type="text"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  required
                />
              </Field>

              <Field id="company-email" label="Company Email">
                <input
                  id="company-email"
                  className="create-recruiter-input"
                  type="email"
                  placeholder="Enter company email"
                  value={companyEmail}
                  onChange={(event) => setCompanyEmail(event.target.value)}
                  required
                />
              </Field>

              <Field id="company-phone" label="Company Phone">
                <input
                  id="company-phone"
                  className="create-recruiter-input"
                  type="tel"
                  placeholder="Enter company phone number"
                  value={companyPhone}
                  onChange={(event) => setCompanyPhone(event.target.value)}
                  required
                />
              </Field>

              <Field id="company-website" label="Company Website" optional>
                <input
                  id="company-website"
                  className="create-recruiter-input"
                  type="url"
                  placeholder="https://www.example.com"
                  value={companyWebsite}
                  onChange={(event) => setCompanyWebsite(event.target.value)}
                />
              </Field>

              <Field id="industry" label="Industry">
                <select
                  id="industry"
                  className="create-recruiter-input"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  required
                >
                  <option value="">Select industry</option>

                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="company-size" label="Company Size">
                <select
                  id="company-size"
                  className="create-recruiter-input"
                  value={companySize}
                  onChange={(event) => setCompanySize(event.target.value)}
                  required
                >
                  <option value="">Select company size</option>

                  {COMPANY_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="company-address" label="Company Address" wide>
                <textarea
                  id="company-address"
                  className="create-recruiter-input"
                  placeholder="Enter complete company address"
                  value={companyAddress}
                  onChange={(event) => setCompanyAddress(event.target.value)}
                  required
                  rows={4}
                />
              </Field>

            </div>

          </section>

          {/* ========== STATUS MESSAGES ========== */}

          {error && <StatusMessage type="error">{error}</StatusMessage>}

          {success && <StatusMessage type="success">{success}</StatusMessage>}

          {/* ========== CREATE BUTTON ========== */}

          <button
            type="submit"
            className="create-recruiter-submit"
            disabled={loading || !canCreate}
          >
            {loading
              ? "Creating Recruiter..."
              : !emailVerified
              ? "Verify Email to Continue"
              : "Create Recruiter Account"}
          </button>

        </form>

      </main>

    </div>
  );
}

export default CreateRecruiter;