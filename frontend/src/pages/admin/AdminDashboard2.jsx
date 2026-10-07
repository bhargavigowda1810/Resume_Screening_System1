import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

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
  // Recruiter List
  // =========================
  const [recruiters, setRecruiters] = useState([]);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);
  const [recruiterListError, setRecruiterListError] = useState("");

  // =========================
  // Selected Recruiter
  // =========================
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  // =========================
  // Status
  // =========================
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // =========================
  // Load Recruiters
  // =========================
  const loadRecruiters = async () => {
    setLoadingRecruiters(true);
    setRecruiterListError("");

    try {
      const response = await api.get(
        "/users/admin/recruiters"
      );

      setRecruiters(
        Array.isArray(response)
          ? response
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load recruiters:",
        error
      );

      setRecruiterListError(
        error?.message ||
          "Unable to load recruiter accounts."
      );
    } finally {
      setLoadingRecruiters(false);
    }
  };

  // =========================
  // Load Recruiters On Page Load
  // =========================
  useEffect(() => {
    loadRecruiters();
  }, []);

  // =========================
  // Logout
  // =========================
  const handleLogout = async () => {
    try {
      await api.post("/users/logout", {});
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      localStorage.removeItem("token");
      navigate("/login", {
        replace: true,
      });
    }
  };

  // =========================
  // Handle Email Change
  // =========================
  const handleEmailChange = (event) => {
    const newEmail = event.target.value;

    setEmail(newEmail);

    /*
     * Changing the email invalidates any previous
     * verification for the old email address.
     */
    setEmailVerified(false);
    setEmailVerificationToken("");
    setEmailOtp("");
    setOtpSent(false);

    setSuccess("");
    setError("");
  };

  // =========================
  // Send Recruiter Email OTP
  // =========================
  const handleSendEmailVerificationOtp = async () => {
    setSuccess("");
    setError("");

    if (!email.trim()) {
      setError(
        "Please enter the recruiter's email address."
      );
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

      setSuccess(
        `OTP sent successfully to ${email.trim()}.`
      );
    } catch (error) {
      console.error(
        "Failed to send email verification OTP:",
        error
      );

      setError(
        error?.message ||
          "Unable to send verification OTP."
      );
    } finally {
      setVerifyingEmail(false);
    }
  };

  // =========================
  // Verify Recruiter Email OTP
  // =========================
  const handleVerifyEmailOtp = async () => {
    setSuccess("");
    setError("");

    if (!email.trim()) {
      setError(
        "Please enter the recruiter's email address."
      );
      return;
    }

    if (!emailOtp.trim()) {
      setError(
        "Please enter the OTP."
      );
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
      setEmailVerificationToken(
        response.verificationToken
      );

      setSuccess(
        "Recruiter email verified successfully. You can now create the recruiter account."
      );
    } catch (error) {
      console.error(
        "Failed to verify recruiter email:",
        error
      );

      setEmailVerified(false);
      setEmailVerificationToken("");

      setError(
        error?.message ||
          "Unable to verify recruiter email."
      );
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

    /*
     * Email verification is mandatory before
     * creating the recruiter account.
     */
    if (
      !emailVerified ||
      !emailVerificationToken
    ) {
      setError(
        "Please verify the recruiter's email before creating the account."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/users/admin/recruiters",
        {
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
        }
      );

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

      // Clear email verification
      setEmailOtp("");
      setOtpSent(false);
      setEmailVerified(false);
      setEmailVerificationToken("");

      // Clear company details
      setCompanyName("");
      setCompanyEmail("");
      setCompanyPhone("");
      setCompanyWebsite("");
      setIndustry("");
      setCompanySize("");
      setCompanyAddress("");

      // Refresh recruiter list
      loadRecruiters();
    } catch (error) {
      console.error(
        "Failed to create recruiter:",
        error
      );

      setError(
        error?.message ||
          "Unable to create recruiter account."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Navigation
  // =========================
  const scrollToSection = (sectionId) => {
    const section =
      document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // =========================
  // Statistics
  // =========================
  const totalRecruiters =
    recruiters.length;

  const verifiedRecruiters =
    recruiters.filter(
      (recruiter) =>
        recruiter.emailVerified === true
    ).length;

  const pendingRecruiters =
    totalRecruiters -
    verifiedRecruiters;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        color: "#1f2937",
      }}
    >
      {/* =====================================================
          TOP NAVIGATION BAR
      ====================================================== */}

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          minHeight: "72px",
          background: "#ffffff",
          borderBottom:
            "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          padding: "12px 40px",
          boxShadow:
            "0 2px 12px rgba(15, 23, 42, 0.06)",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "11px",
              background:
                "linear-gradient(135deg, #2563eb, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              color: "#ffffff",
              fontWeight: "800",
              fontSize: "18px",
              boxShadow:
                "0 5px 15px rgba(37, 99, 235, 0.25)",
            }}
          >
            RS
          </div>

          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#111827",
              }}
            >
              ResumeScreening
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#6b7280",
                letterSpacing: "0.5px",
              }}
            >
              ADMIN PANEL
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            style={{
              border: "none",
              background: "#eff6ff",
              color: "#2563eb",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "recruiter-management"
              )
            }
            style={{
              border: "none",
              background: "transparent",
              color: "#4b5563",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Recruiters
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "create-recruiter"
              )
            }
            style={{
              border: "none",
              background: "transparent",
              color: "#4b5563",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Create Recruiter
          </button>
        </div>

        {/* Admin Profile + Logout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "#e0e7ff",
              color: "#4338ca",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              fontWeight: "700",
            }}
          >
            A
          </div>

          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              Administrator
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              System Admin
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              marginLeft: "12px",
              padding: "9px 15px",
              border:
                "1px solid #fecaca",
              borderRadius: "8px",
              background: "#fff1f2",
              color: "#dc2626",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px",
        }}
      >
        {/* =================================================
            WELCOME SECTION
        ================================================== */}

        <section
          style={{
            background:
              "linear-gradient(135deg, #1d4ed8, #4338ca)",
            borderRadius: "18px",
            padding: "35px",
            color: "#ffffff",
            marginBottom: "30px",
            boxShadow:
              "0 12px 30px rgba(37, 99, 235, 0.18)",
          }}
        >
          <div
            style={{
              maxWidth: "700px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "1px",
                textTransform:
                  "uppercase",
                opacity: 0.8,
                marginBottom: "10px",
              }}
            >
              Administration
            </div>

            <h1
              style={{
                margin: "0 0 12px",
                fontSize: "32px",
              }}
            >
              Welcome, Administrator
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: "16px",
                lineHeight: "1.7",
                opacity: 0.9,
              }}
            >
              Manage recruiter accounts,
              monitor verification status,
              and maintain recruiter
              access to the Resume Screening
              System.
            </p>
          </div>
        </section>

        {/* =================================================
            STATISTICS
        ================================================== */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* Total Recruiters */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "24px",
              border:
                "1px solid #e5e7eb",
              boxShadow:
                "0 4px 15px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Total Recruiters
                </p>

                <h2
                  style={{
                    margin: "8px 0 0",
                    fontSize: "30px",
                    color: "#111827",
                  }}
                >
                  {totalRecruiters}
                </h2>
              </div>

              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize: "21px",
                  fontWeight: "800",
                }}
              >
                R
              </div>
            </div>
          </div>

          {/* Verified */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "24px",
              border:
                "1px solid #e5e7eb",
              boxShadow:
                "0 4px 15px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Verified Recruiters
                </p>

                <h2
                  style={{
                    margin: "8px 0 0",
                    fontSize: "30px",
                    color: "#166534",
                  }}
                >
                  {verifiedRecruiters}
                </h2>
              </div>

              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize: "21px",
                  fontWeight: "800",
                }}
              >
                ✓
              </div>
            </div>
          </div>

          {/* Pending */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "24px",
              border:
                "1px solid #e5e7eb",
              boxShadow:
                "0 4px 15px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Pending Verification
                </p>

                <h2
                  style={{
                    margin: "8px 0 0",
                    fontSize: "30px",
                    color: "#92400e",
                  }}
                >
                  {pendingRecruiters}
                </h2>
              </div>

              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#fef3c7",
                  color: "#d97706",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize: "21px",
                  fontWeight: "800",
                }}
              >
                !
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            RECRUITER MANAGEMENT
        ================================================== */}

        <section
          id="recruiter-management"
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "30px",
            marginBottom: "30px",
            border:
              "1px solid #e5e7eb",
            boxShadow:
              "0 5px 20px rgba(15, 23, 42, 0.05)",
            scrollMarginTop: "90px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "25px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 7px",
                  fontSize: "22px",
                }}
              >
                Recruiter Management
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                View all recruiter and
                company information created
                by the Administrator.
              </p>
            </div>

            <button
              type="button"
              onClick={loadRecruiters}
              disabled={loadingRecruiters}
              style={{
                padding: "11px 18px",
                border:
                  "1px solid #2563eb",
                borderRadius: "8px",
                cursor:
                  loadingRecruiters
                    ? "not-allowed"
                    : "pointer",
                background: "#ffffff",
                color: "#2563eb",
                fontWeight: "700",
              }}
            >
              {loadingRecruiters
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>
          </div>

          {/* Error */}
          {recruiterListError && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "8px",
                border:
                  "1px solid #fecaca",
              }}
            >
              {recruiterListError}
            </div>
          )}

          {/* Loading */}
          {loadingRecruiters && (
            <div
              style={{
                padding: "35px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Loading recruiters...
            </div>
          )}

          {/* Empty */}
          {!loadingRecruiters &&
            !recruiterListError &&
            recruiters.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  background: "#f9fafb",
                  borderRadius: "10px",
                  color: "#6b7280",
                }}
              >
                No recruiter accounts
                have been created yet.
              </div>
            )}

          {/* Recruiter Cards */}
          {!loadingRecruiters &&
            recruiters.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(330px, 1fr))",
                  gap: "20px",
                }}
              >
                {recruiters.map(
                  (recruiter) => (
                    <div
                      key={
                        recruiter.userUuid
                      }
                      style={{
                        border:
                          "1px solid #e5e7eb",
                        borderRadius: "14px",
                        padding: "22px",
                        background:
                          "#ffffff",
                        boxShadow:
                          "0 3px 12px rgba(15, 23, 42, 0.04)",
                      }}
                    >
                      {/* Recruiter Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          gap: "15px",
                          marginBottom:
                            "18px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width:
                                "46px",
                              height:
                                "46px",
                              borderRadius:
                                "50%",
                              background:
                                "#e0e7ff",
                              color:
                                "#4338ca",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              fontWeight:
                                "700",
                              fontSize:
                                "18px",
                            }}
                          >
                            {recruiter.name
                              ? recruiter.name
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()
                              : "R"}
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight:
                                  "700",
                                fontSize:
                                  "16px",
                                color:
                                  "#111827",
                              }}
                            >
                              {recruiter.name ||
                                "-"}
                            </div>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#64748b",
                              }}
                            >
                              {recruiter.designation ||
                                "Recruiter"}
                            </div>
                          </div>
                        </div>

                        {recruiter.emailVerified ? (
                          <span
                            style={{
                              padding:
                                "5px 9px",
                              borderRadius:
                                "20px",
                              background:
                                "#dcfce7",
                              color:
                                "#166534",
                              fontSize:
                                "11px",
                              fontWeight:
                                "700",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            ✓ Verified
                          </span>
                        ) : (
                          <span
                            style={{
                              padding:
                                "5px 9px",
                              borderRadius:
                                "20px",
                              background:
                                "#fef3c7",
                              color:
                                "#92400e",
                              fontSize:
                                "11px",
                              fontWeight:
                                "700",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            ! Pending
                          </span>
                        )}
                      </div>

                      {/* Basic Information */}
                      <div
                        style={{
                          marginBottom:
                            "18px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "120px 1fr",
                            gap:
                              "8px 12px",
                            fontSize:
                              "13px",
                          }}
                        >
                          <strong>
                            Email
                          </strong>
                          <span
                            style={{
                              color:
                                "#475569",
                              wordBreak:
                                "break-word",
                            }}
                          >
                            {recruiter.email ||
                              "-"}
                          </span>

                          <strong>
                            Phone
                          </strong>
                          <span
                            style={{
                              color:
                                "#475569",
                            }}
                          >
                            {recruiter.phone ||
                              "-"}
                          </span>

                          <strong>
                            Role
                          </strong>
                          <span
                            style={{
                              color:
                                "#475569",
                            }}
                          >
                            {recruiter.role ||
                              "RECRUITER"}
                          </span>

                          <strong>
                            Created
                          </strong>
                          <span
                            style={{
                              color:
                                "#475569",
                            }}
                          >
                            {recruiter.createdAt
                              ? new Date(
                                  recruiter.createdAt
                                ).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Company Information */}
                      <div
                        style={{
                          borderTop:
                            "1px solid #e5e7eb",
                          paddingTop:
                            "18px",
                          marginBottom:
                            "18px",
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              "13px",
                            fontWeight:
                              "800",
                            color:
                              "#1f2937",
                            marginBottom:
                              "12px",
                          }}
                        >
                          Company
                          Information
                        </div>

                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "120px 1fr",
                            gap:
                              "8px 12px",
                            fontSize:
                              "13px",
                          }}
                        >
                          <strong>
                            Company
                          </strong>
                          <span
                            style={{
                              color:
                                "#475569",
                            }}
                          >
                            {recruiter.companyName ||
                              "-"}
                          </span>

                          <strong>
                            Industry
                          </strong>
                          <span
                            style={{
                              color:
                                "#475569",
                            }}
                          >
                            {recruiter.industry ||
                              "-"}
                          </span>

                          <strong>
                            Size
                          </strong>
                          <span
                            style={{
                              color:
                                "#475569",
                            }}
                          >
                            {recruiter.companySize ||
                              "-"}
                          </span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRecruiter(
                            recruiter
                          )
                        }
                        style={{
                          width: "100%",
                          padding:
                            "11px 15px",
                          border:
                            "1px solid #2563eb",
                          borderRadius:
                            "8px",
                          background:
                            "#eff6ff",
                          color:
                            "#2563eb",
                          fontWeight:
                            "700",
                          cursor:
                            "pointer",
                        }}
                      >
                        View Complete Details
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
        </section>

        {/* =================================================
            SELECTED RECRUITER DETAILS
        ================================================== */}

        {selectedRecruiter && (
          <section
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "30px",
              marginBottom: "30px",
              border:
                "1px solid #e5e7eb",
              boxShadow:
                "0 5px 20px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: "0 0 7px",
                    fontSize: "22px",
                  }}
                >
                  Complete Recruiter Details
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                  }}
                >
                  Complete account and company
                  information.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRecruiter(
                    null
                  )
                }
                style={{
                  padding: "10px 16px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#475569",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Close Details
              </button>
            </div>

            {/* Recruiter Information */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                marginBottom: "25px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 18px",
                    fontSize: "17px",
                  }}
                >
                  Recruiter Information
                </h3>

                <div
                  style={{
                    display:
                      "grid",
                    gap: "12px",
                    fontSize: "14px",
                  }}
                >
                  <div>
                    <strong>
                      Full Name
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                      }}
                    >
                      {selectedRecruiter.name ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Email
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {selectedRecruiter.email ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Phone
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                      }}
                    >
                      {selectedRecruiter.phone ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Designation
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                      }}
                    >
                      {selectedRecruiter.designation ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Role
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                      }}
                    >
                      {selectedRecruiter.role ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Email Verification
                    </strong>
                    <div
                      style={{
                        color:
                          selectedRecruiter.emailVerified
                            ? "#166534"
                            : "#92400e",
                        marginTop:
                          "4px",
                        fontWeight:
                          "700",
                      }}
                    >
                      {selectedRecruiter.emailVerified
                        ? "✓ Verified"
                        : "! Pending"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Account Created
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                      }}
                    >
                      {selectedRecruiter.createdAt
                        ? new Date(
                            selectedRecruiter.createdAt
                          ).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div
                style={{
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 18px",
                    fontSize: "17px",
                  }}
                >
                  Company Information
                </h3>

                <div
                  style={{
                    display:
                      "grid",
                    gap: "12px",
                    fontSize: "14px",
                  }}
                >
                  <div>
                    <strong>
                      Company Name
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                      }}
                    >
                      {selectedRecruiter.companyName ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Company Email
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {selectedRecruiter.companyEmail ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Company Phone
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                      }}
                    >
                      {selectedRecruiter.companyPhone ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Company Website
                    </strong>
                    <div
                      style={{
                        color:
                          "#2563eb",
                        marginTop:
                          "4px",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {selectedRecruiter.companyWebsite ? (
                        <a
                          href={
                            selectedRecruiter.companyWebsite
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color:
                              "#2563eb",
                            textDecoration:
                              "none",
                          }}
                        >
                          {
                            selectedRecruiter.companyWebsite
                          }
                        </a>
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Industry
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                      }}
                    >
                      {selectedRecruiter.industry ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Company Size
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                      }}
                    >
                      {selectedRecruiter.companySize ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Company Address
                    </strong>
                    <div
                      style={{
                        color:
                          "#475569",
                        marginTop:
                          "4px",
                        lineHeight:
                          "1.6",
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {selectedRecruiter.companyAddress ||
                        "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            CREATE RECRUITER
        ================================================== */}

        <section
          id="create-recruiter"
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "30px",
            border:
              "1px solid #e5e7eb",
            boxShadow:
              "0 5px 20px rgba(15, 23, 42, 0.05)",
            scrollMarginTop: "90px",
          }}
        >
          <div
            style={{
              marginBottom: "30px",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "22px",
              }}
            >
              Create Recruiter Account
            </h2>

            <p
              style={{
                color: "#6b7280",
                margin: 0,
                lineHeight: "1.6",
              }}
            >
              Verify the recruiter's email
              first, then create the recruiter
              account and associate it with
              their company.
            </p>
          </div>

          {/* =================================================
              RECRUITER INFORMATION
          ================================================== */}

          <div
            style={{
              padding: "24px",
              background: "#f8fafc",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px",
                color: "#1f2937",
              }}
            >
              Recruiter Information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="recruiter-name"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Full Name
                </label>

                <input
                  id="recruiter-name"
                  type="text"
                  placeholder="Enter recruiter's full name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  required
                  style={{
                    width: "100%",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing:
                      "border-box",
                    outline: "none",
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="recruiter-email"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Recruiter Email
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems:
                      "stretch",
                  }}
                >
                  <input
                    id="recruiter-email"
                    type="email"
                    placeholder="Enter recruiter's email"
                    value={email}
                    onChange={
                      handleEmailChange
                    }
                    required
                    disabled={
                      verifyingEmail ||
                      verifyingOtp ||
                      emailVerified
                    }
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding:
                        "12px 14px",
                      border:
                        emailVerified
                          ? "1px solid #22c55e"
                          : "1px solid #d1d5db",
                      borderRadius: "8px",
                      boxSizing:
                        "border-box",
                      background:
                        emailVerified
                          ? "#f0fdf4"
                          : "#ffffff",
                    }}
                  />

                  <button
                    type="button"
                    onClick={
                      handleSendEmailVerificationOtp
                    }
                    disabled={
                      verifyingEmail ||
                      verifyingOtp ||
                      emailVerified ||
                      !email.trim()
                    }
                    style={{
                      padding:
                        "12px 16px",
                      border: "none",
                      borderRadius: "8px",
                      cursor:
                        verifyingEmail ||
                        verifyingOtp ||
                        emailVerified ||
                        !email.trim()
                          ? "not-allowed"
                          : "pointer",
                      background:
                        emailVerified
                          ? "#16a34a"
                          : "#2563eb",
                      color: "#ffffff",
                      fontWeight: "700",
                      whiteSpace:
                        "nowrap",
                    }}
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

                {emailVerified && (
                  <div
                    style={{
                      marginTop: "8px",
                      color: "#166534",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    ✓ Email address verified successfully.
                  </div>
                )}

                {/* OTP */}
                {otpSent &&
                  !emailVerified && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "15px",
                        background:
                          "#eff6ff",
                        border:
                          "1px solid #bfdbfe",
                        borderRadius:
                          "9px",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "13px",
                          color:
                            "#475569",
                          marginBottom:
                            "10px",
                        }}
                      >
                        Enter the 6-digit OTP
                        sent to{" "}
                        <strong>
                          {email}
                        </strong>
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          gap: "10px",
                        }}
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter OTP"
                          value={emailOtp}
                          onChange={(
                            event
                          ) =>
                            setEmailOtp(
                              event.target.value.replace(
                                /\D/g,
                                ""
                              )
                            )
                          }
                          style={{
                            flex: 1,
                            padding:
                              "12px 14px",
                            border:
                              "1px solid #d1d5db",
                            borderRadius:
                              "8px",
                            boxSizing:
                              "border-box",
                            letterSpacing:
                              "3px",
                            fontWeight:
                              "700",
                          }}
                        />

                        <button
                          type="button"
                          onClick={
                            handleVerifyEmailOtp
                          }
                          disabled={
                            verifyingOtp ||
                            emailOtp.length !==
                              6
                          }
                          style={{
                            padding:
                              "12px 18px",
                            border: "none",
                            borderRadius:
                              "8px",
                            cursor:
                              verifyingOtp ||
                              emailOtp.length !==
                                6
                                ? "not-allowed"
                                : "pointer",
                            background:
                              "#16a34a",
                            color:
                              "#ffffff",
                            fontWeight:
                              "700",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {verifyingOtp
                            ? "Verifying..."
                            : "Verify OTP"}
                        </button>
                      </div>
                    </div>
                  )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="recruiter-phone"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Phone Number
                </label>

                <input
                  id="recruiter-phone"
                  type="tel"
                  placeholder="Enter recruiter's phone number"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  required
                  style={{
                    width: "100%",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* Designation */}
              <div>
                <label
                  htmlFor="recruiter-designation"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Designation
                </label>

                <input
                  id="recruiter-designation"
                  type="text"
                  placeholder="HR Manager, Talent Acquisition Specialist"
                  value={designation}
                  onChange={(event) =>
                    setDesignation(
                      event.target.value
                    )
                  }
                  required
                  style={{
                    width: "100%",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* Password */}
              <div
                style={{
                  gridColumn:
                    "1 / -1",
                }}
              >
                <label
                  htmlFor="recruiter-password"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Recruiter Password
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <input
                    id="recruiter-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create recruiter password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    required
                    minLength={6}
                    style={{
                      flex: 1,
                      padding:
                        "12px 14px",
                      border:
                        "1px solid #d1d5db",
                      borderRadius: "8px",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    style={{
                      padding:
                        "12px 18px",
                      border:
                        "1px solid #d1d5db",
                      borderRadius: "8px",
                      background:
                        "#ffffff",
                      cursor: "pointer",
                      fontWeight:
                        "600",
                    }}
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              COMPANY INFORMATION
          ================================================== */}

          <div
            style={{
              padding: "24px",
              background: "#f8fafc",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px",
                color: "#1f2937",
              }}
            >
              Company Information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {/* Company Name */}
              <div>
                <label
                  htmlFor="company-name"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Company Name
                </label>

                <input
                  id="company-name"
                  type="text"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(event) =>
                    setCompanyName(
                      event.target.value
                    )
                  }
                  required
                  style={{
                    width: "100%",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* Company Email */}
              <div>
                <label
                  htmlFor="company-email"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Company Email
                </label>

                <input
                  id="company-email"
                  type="email"
                  placeholder="Enter company email"
                  value={companyEmail}
                  onChange={(event) =>
                    setCompanyEmail(
                      event.target.value
                    )
                  }
                  required
                  style={{
                    width: "100%",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* Company Phone */}
              <div>
                <label
                  htmlFor="company-phone"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Company Phone
                </label>

                <input
                  id="company-phone"
                  type="tel"
                  placeholder="Enter company phone number"
                  value={companyPhone}
                  onChange={(event) =>
                    setCompanyPhone(
                      event.target.value
                    )
                  }
                  required
                  style={{
                    width: "100%",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* Website */}
              <div>
                <label
                  htmlFor="company-website"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Company Website
                </label>

                <input
                  id="company-website"
                  type="url"
                  placeholder="https://www.example.com"
                  value={companyWebsite}
                  onChange={(event) =>
                    setCompanyWebsite(
                      event.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* Industry */}
              <div>
                <label
                  htmlFor="industry"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Industry
                </label>

                <select
                  id="industry"
                  value={industry}
                  onChange={(event) =>
                    setIndustry(
                      event.target.value
                    )
                  }
                  required
                  style={{
                    width: "100%",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing:
                      "border-box",
                    background:
                      "#ffffff",
                  }}
                >
                  <option value="">
                    Select industry
                  </option>

                  <option value="Information Technology">
                    Information Technology
                  </option>

                  <option value="Finance">
                    Finance
                  </option>

                  <option value="Healthcare">
                    Healthcare
                  </option>

                  <option value="Education">
                    Education
                  </option>

                  <option value="Manufacturing">
                    Manufacturing
                  </option>

                  <option value="Retail">
                    Retail
                  </option>

                  <option value="Consulting">
                    Consulting
                  </option>

                  <option value="Telecommunications">
                    Telecommunications
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* Company Size */}
              <div>
                <label
                  htmlFor="company-size"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Company Size
                </label>

                <select
                  id="company-size"
                  value={companySize}
                  onChange={(event) =>
                    setCompanySize(
                      event.target.value
                    )
                  }
                  required
                  style={{
                    width: "100%",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing:
                      "border-box",
                    background:
                      "#ffffff",
                  }}
                >
                  <option value="">
                    Select company size
                  </option>

                  <option value="1-10">
                    1-10 Employees
                  </option>

                  <option value="11-50">
                    11-50 Employees
                  </option>

                  <option value="51-200">
                    51-200 Employees
                  </option>

                  <option value="201-500">
                    201-500 Employees
                  </option>

                  <option value="501-1000">
                    501-1000 Employees
                  </option>

                  <option value="1001-5000">
                    1001-5000 Employees
                  </option>

                  <option value="5000+">
                    5000+ Employees
                  </option>
                </select>
              </div>

              {/* Address */}
              <div
                style={{
                  gridColumn:
                    "1 / -1",
                }}
              >
                <label
                  htmlFor="company-address"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Company Address
                </label>

                <textarea
                  id="company-address"
                  placeholder="Enter complete company address"
                  value={companyAddress}
                  onChange={(event) =>
                    setCompanyAddress(
                      event.target.value
                    )
                  }
                  required
                  rows={4}
                  style={{
                    width: "100%",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing:
                      "border-box",
                    resize: "vertical",
                    fontFamily:
                      "inherit",
                  }}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              ERROR / SUCCESS
          ================================================== */}

          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "8px",
                border:
                  "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px",
                background: "#dcfce7",
                color: "#166534",
                borderRadius: "8px",
                border:
                  "1px solid #bbf7d0",
              }}
            >
              {success}
            </div>
          )}

          {/* =================================================
              CREATE BUTTON
          ================================================== */}

          <button
            type="button"
            disabled={
              loading ||
              !emailVerified ||
              !emailVerificationToken
            }
            onClick={() => {
              const form =
                document.querySelector(
                  "#admin-create-recruiter-form"
                );

              if (form) {
                form.requestSubmit();
              }
            }}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "9px",
              cursor:
                loading ||
                !emailVerified ||
                !emailVerificationToken
                  ? "not-allowed"
                  : "pointer",
              background:
                !emailVerified ||
                !emailVerificationToken
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #2563eb, #4f46e5)",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "15px",
              boxShadow:
                emailVerified
                  ? "0 6px 15px rgba(37, 99, 235, 0.2)"
                  : "none",
            }}
          >
            {loading
              ? "Creating Recruiter..."
              : !emailVerified
              ? "Verify Email to Continue"
              : "Create Recruiter Account"}
          </button>

          {/* Hidden form wrapper */}
          <form
            id="admin-create-recruiter-form"
            onSubmit={
              handleCreateRecruiter
            }
            style={{
              display: "none",
            }}
          >
            <button type="submit">
              Submit
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
