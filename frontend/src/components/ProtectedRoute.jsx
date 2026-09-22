import { Navigate } from "react-router-dom";

function ProtectedRoute({ allowedRole, children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User has the wrong role
  if (user.role !== allowedRole) {
    if (user.role === "APPLICANT") {
      return <Navigate to="/applicant" replace />;
    }

    if (user.role === "RECRUITER") {
      return <Navigate to="/recruiter" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;