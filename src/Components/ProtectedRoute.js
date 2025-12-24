import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const EXPIRY_HOURS = 8;

const ProtectedRoute = ({ children }) => {
  const [isValidSession, setIsValidSession] = useState(true);

  useEffect(() => {
    checkSessionValidity();
    // Set up interval to check session every minute
    const interval = setInterval(checkSessionValidity, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkSessionValidity = () => {
    const isAuthenticated = localStorage.getItem("paisaonsalary_authenticated") === "true";
    const loginTime = localStorage.getItem("paisaonsalary_auth_time");

    if (!isAuthenticated || !loginTime) {
      setIsValidSession(false);
      return;
    }

    const now = new Date();
    const loginDate = new Date(loginTime);
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);

    if (hoursDiff > EXPIRY_HOURS) {
      // Session expired
      localStorage.removeItem("paisaonsalary_authenticated");
      localStorage.removeItem("paisaonsalary_auth_time");
      localStorage.removeItem("paisaonsalary_user");
      setIsValidSession(false);
    } else {
      setIsValidSession(true);
      
      // Update session timer display (optional)
      const remainingMinutes = Math.floor((EXPIRY_HOURS - hoursDiff) * 60);
      if (remainingMinutes < 5) {
        console.warn(`Session expires in ${remainingMinutes} minutes`);
      }
    }
  };

  if (!isValidSession) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;