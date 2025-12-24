import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("paisaonsalary_authenticated") === "true";
  const loginTime = localStorage.getItem("paisaonsalary_auth_time");

  if (isAuthenticated && loginTime) {
    const now = new Date();
    const loginDate = new Date(loginTime);
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
    
    // If session is still valid, redirect to dashboard
    if (hoursDiff <= 8) {
      return <Navigate to="/dashboard" replace />;
    } else {
      // Clear expired session
      localStorage.removeItem("paisaonsalary_authenticated");
      localStorage.removeItem("paisaonsalary_auth_time");
    }
  }

  return children;
};

export default PublicRoute;