import React, { useEffect, useState, useCallback } from "react";
import Papa from "papaparse";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwaGNsk4xLU0dDrg3Q8EbTV7Bv96ZYiHpzl-dwrUSM7HlttloPCgDl2M9uolb1ZR0wfeHSLA6At8e3/pub?gid=1868562510&single=true&output=csv";

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  // Function to fetch CSV data
  const fetchCSVData = useCallback(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setData(result.data);
        setLoading(false);
        setLastUpdated(new Date());
        setRefreshCount(prev => prev + 1);
      },
      error: (error) => {
        console.error("Error fetching CSV:", error);
        setLoading(false);
      }
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCSVData();
  }, [fetchCSVData]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    let intervalId;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchCSVData();
      }, 5000); // 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, fetchCSVData]);

  const handleBack = () => {
    window.history.back();
  };

  const handleLogout = () => {
    alert("Logout functionality will be implemented here!");
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleManualRefresh = () => {
    setLoading(true);
    fetchCSVData();
  };

  return (
    <>
      {/* ===== Styles ===== */}
      <style>{`
        body {
          margin: 0;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f4f6fb 0%, #eef2ff 100%);
          min-height: 100vh;
        }

        .navbar {
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: white;
          padding: 18px 35px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
          border-bottom: 3px solid #8b5cf6;
        }

        .company-name {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .company-icon {
          background: white;
          padding: 8px;
          border-radius: 10px;
          color: #4f46e5;
          font-weight: bold;
          font-size: 20px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
        }

        .navbar-buttons {
          display: flex;
          gap: 20px;
        }

        .nav-button {
          background: rgba(255, 255, 255, 0.18);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.35);
          padding: 11px 26px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 16px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.3px;
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .nav-button:active {
          transform: translateY(0);
        }

        .back-btn {
          background: rgba(139, 92, 246, 0.8);
        }

        .logout-btn {
          background: rgba(239, 68, 68, 0.8);
        }

        .container {
          padding: 35px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          overflow-x: auto;
          margin-top: 25px;
          border: 1px solid #e5e7eb;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        th {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          padding: 18px 16px;
          text-align: left;
          font-weight: 800;
          font-size: 18px;
          color: white;
          border: none;
          position: sticky;
          top: 0;
          letter-spacing: 0.5px;
        }

        th:first-child {
          border-radius: 16px 0 0 0;
        }

        th:last-child {
          border-radius: 0 16px 0 0;
        }

        td {
          padding: 16px;
          border-bottom: 2px solid #f3f4f6;
          font-weight: 700;
          font-size: 17px;
          color: #1f2937;
          transition: all 0.2s;
        }

        tr:hover td {
          background: #f8fafc;
          color: #111827;
          transform: scale(1.01);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        tr:nth-child(even) {
          background: #f9fafb;
        }

        .loading {
          text-align: center;
          font-size: 24px;
          margin-top: 80px;
          color: #4f46e5;
          font-weight: 700;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #e5e7eb;
          border-top: 5px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .footer {
          text-align: center;
          padding: 25px;
          font-size: 15px;
          color: #6b7280;
          margin-top: 50px;
          background: white;
          border-top: 2px solid #e5e7eb;
          font-weight: 600;
        }

        .sheet-info {
          background: #e0e7ff;
          padding: 15px 25px;
          border-radius: 12px;
          margin-bottom: 20px;
          border-left: 5px solid #4f46e5;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sheet-info h3 {
          margin: 0;
          color: #3730a3;
          font-size: 20px;
          font-weight: 800;
        }

        .total-records {
          background: #4f46e5;
          color: white;
          padding: 8px 18px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 16px;
        }

        .refresh-controls {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .refresh-button {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .refresh-button:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .refresh-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f3f4f6;
          padding: 8px 15px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          color: #4b5563;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #10b981;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .last-updated {
          font-size: 13px;
          color: #6b7280;
          margin-top: 10px;
          text-align: right;
          font-weight: 600;
        }

        .refresh-count {
          background: #8b5cf6;
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          margin-left: 8px;
        }

        .auto-refresh-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 15px 20px;
            flex-direction: column;
            gap: 20px;
          }
          
          .company-name {
            font-size: 22px;
            text-align: center;
          }
          
          .navbar-buttons {
            width: 100%;
            justify-content: space-between;
          }
          
          .nav-button {
            padding: 10px 20px;
            font-size: 15px;
          }
          
          .container {
            padding: 20px;
          }
          
          th, td {
            padding: 14px 12px;
            font-size: 16px;
          }
          
          .sheet-info {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .refresh-controls {
            flex-direction: column;
            width: 100%;
          }
        }
      `}</style>

      {/* ===== Navbar ===== */}
      <div className="navbar">
        <div className="company-name">
          <span className="company-icon">₹</span>
          PaisaOnSalary
        </div>
        <div className="navbar-buttons">
          <button className="nav-button back-btn" onClick={handleBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <button className="nav-button logout-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="container">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            Loading Google Sheet Data...
          </div>
        ) : (
          <>
            <div className="sheet-info">
              <div>
                <h3>📊 Employee Salary Data Dashboard</h3>
                {autoRefresh && (
                  <div className="auto-refresh-indicator">
                    <span className="pulse-dot"></span>
                    Auto-refresh every 5 seconds
                  </div>
                )}
              </div>
              <div className="refresh-controls">
                <button className="refresh-button" onClick={handleManualRefresh}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                  Refresh Now
                </button>
                
                <div className="refresh-toggle">
                  <span>Auto Refresh:</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={autoRefresh}
                      onChange={toggleAutoRefresh}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="refresh-count">{refreshCount}</span>
                </div>
                
                <div className="total-records">
                  Total Records: {data.length}
                </div>
              </div>
            </div>
            
            {lastUpdated && (
              <div className="last-updated">
                📅 Last Updated: {lastUpdated.toLocaleTimeString()} | 
                🔄 Auto-refresh: {autoRefresh ? "ON" : "OFF"} | 
                ⏱️ Next refresh in: {autoRefresh ? "5 seconds" : "Disabled"}
              </div>
            )}
            
            <div className="card">
              <table>
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key}>{key.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>
                          <strong>{val || "—"}</strong>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ===== Footer ===== */}
      <div className="footer">
        <strong>Powered by Google Sheets • Live Auto-Refreshing Data (5s) • PaisaOnSalary Dashboard</strong>
      </div>
    </>
  );
}