import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../services/api";

function ProtectedRoute({ allowedRole, children }) {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (mounted) {
          setUser(null);
          setCheckingAuth(false);
        }
        return;
      }

      try {
        const response = await api.get("/users/me");

        if (mounted) {
          setUser(response);

          if (response.userUuid) {
            localStorage.setItem(
              "userUuid",
              response.userUuid
            );
          }

          if (response.role) {
            localStorage.setItem(
              "role",
              response.role
            );
          }
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        localStorage.removeItem("token");
        localStorage.removeItem("userUuid");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  if (checkingAuth) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    if (user.role === "APPLICANT") {
      return <Navigate to="/applicant" replace />;
    }

    if (user.role === "RECRUITER") {
      return <Navigate to="/recruiter" replace />;
    }

    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

