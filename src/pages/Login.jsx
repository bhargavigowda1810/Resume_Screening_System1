import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email,
        password,
      });

      console.log("Login successful:", response);

      // Check whether the selected login type matches the user's role
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

      // Save logged-in user information
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

  return (
    <div>
      <h1>Resume Screening System</h1>

      <h2>Login</h2>

      {/* Login Type Selection */}
      {!loginType && (
        <div>
          <h3>Login As</h3>

          <button
            type="button"
            onClick={() => setLoginType("APPLICANT")}
          >
            Applicant Login
          </button>

          <button
            type="button"
            onClick={() => setLoginType("RECRUITER")}
          >
            Recruiter Login
          </button>
        </div>
      )}

      {/* Login Form */}
      {loginType && (
        <div>
          <h3>
            {loginType === "APPLICANT"
              ? "Applicant Login"
              : "Recruiter Login"}
          </h3>

          <form onSubmit={handleLogin}>

            <div>
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && (
              <p>{error}</p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          {/* Change Login Type */}
          <button
            type="button"
            onClick={() => {
              setLoginType("");
              setEmail("");
              setPassword("");
              setError("");
            }}
          >
            Change Login Type
          </button>
        </div>
      )}

      {/* Registration */}
      <p>
        Don't have an account?{" "}
        <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;

