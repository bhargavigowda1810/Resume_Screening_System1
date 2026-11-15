import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";

function RecruiterVerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(
    searchParams.get("email") || ""
  );

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/users/verify-recruiter-otp",
        {
          email: email.trim(),
          otp: otp.trim(),
        }
      );

      setSuccess(
        response.message ||
        "Email verified successfully. You can now log in."
      );

      setOtp("");

      /*
       * Give the recruiter a short moment to see
       * the success message before going to login.
       */
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error(
        "Recruiter OTP verification failed:",
        error
      );

      setError(
        error?.message ||
        "Unable to verify OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "#f5f7fb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#ffffff",
          padding: "35px",
          borderRadius: "12px",
          boxShadow:
            "0 2px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <h1>Recruiter Email Verification</h1>

          <p>
            Enter the OTP sent to your recruiter email
            address.
          </p>
        </div>

        <form onSubmit={handleVerifyOtp}>

          {/* EMAIL */}

          <div style={{ marginBottom: "20px" }}>
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

            <input
              id="recruiter-email"
              type="email"
              placeholder="Enter recruiter email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* OTP */}

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="recruiter-otp"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              OTP
            </label>

            <input
              id="recruiter-otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(event) => {
                const value =
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                setOtp(value);
              }}
              maxLength={6}
              inputMode="numeric"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                boxSizing: "border-box",
                letterSpacing: "4px",
                fontSize: "18px",
                textAlign: "center",
              }}
            />
          </div>

          {/* ERROR */}

          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "6px",
              }}
            >
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px",
                background: "#dcfce7",
                color: "#166534",
                borderRadius: "6px",
              }}
            >
              {success}
            </div>
          )}

          {/* VERIFY BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 24px",
              border: "none",
              borderRadius: "6px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: "600",
            }}
          >
            {loading
              ? "Verifying..."
              : "Verify Email"}
          </button>

        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecruiterVerifyOtp;