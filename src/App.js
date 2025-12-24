import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import LoginPage from "./Components/LoginPage";
import GoogleSheetPieWithTable from "./Components/GoogleSheetPieWithTable";
import EmployeeCollectionPage from "./Components/EmployeeCollectionPage";
import DataExporter from "./Components/DataExporter";
import ProtectedRoute from "./Components/ProtectedRoute";
import PublicRoute from "./Components/PublicRoute";
import CmReport from "./Components/Cmreport";
import Summary from "./Components/Summary"; 

function App() {
  useEffect(() => {
    // Check authentication on app load
    const isAuthenticated = localStorage.getItem("paisaonsalary_authenticated") === "true";
    console.log("Authentication Status:", isAuthenticated);
    
    if (isAuthenticated) {
      const loginTime = localStorage.getItem("paisaonsalary_auth_time");
      console.log("Login Time:", loginTime);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <GoogleSheetPieWithTable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee-collection"
          element={
            <ProtectedRoute>
              <EmployeeCollectionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/data-export"
          element={
            <ProtectedRoute>
              <DataExporter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cm-report"
          element={
            <ProtectedRoute>
              <CmReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Summary"
          element={
            <ProtectedRoute>
              <Summary />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;