import React, { useEffect, useState, useRef } from "react";
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhkgBlDhx8JpRxdy_YpYlLfv76KhKDcF4Xkh4BDu6IjMIkAI3CZaoWqxthmqZi13Zaky3xgAW-kI5l/pub?output=csv";

// Navbar Component
function Navbar() {
  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>
        <div style={styles.logoContainer}>
          <h1 style={styles.companyName}>Paisaonsalry</h1>
          <span style={styles.tagline}>Financial Solutions</span>
        </div>
        <div style={styles.navLinks}>
          <a href="/dase" style={styles.navLink}>Home</a>
          <a href="/dashboard" style={styles.navLink}>Dashboard</a>
          <a href="/cmreport" style={styles.navLinkActive}>CM Report</a>
          <a href="/Summary" style={styles.navLink}>Summary</a>
          <a href="/settings" style={styles.navLink}>Settings</a>
        </div>
        <div style={styles.userSection}>
          <button style={styles.profileBtn}>
            <span style={styles.profileIcon}>👤</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

// Main Cmreport Component
export default function Cmreport() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newRows, setNewRows] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const previousDataRef = useRef([]);
  const refreshIntervalRef = useRef(null);

  const fetchData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch(CSV_URL);
      if (!response.ok) throw new Error("Failed to fetch CSV");
      const csv = await response.text();
      
      const rows = csv
        .trim()
        .split("\n")
        .map((row) =>
          row.split(",").map((cell) => cell.replace(/^"|"$/g, ""))
        );
      
      // Check for new or changed rows
      const currentData = rows.slice(1);
      const previousData = previousDataRef.current;
      
      if (previousData.length > 0) {
        const newRowIndices = [];
        // Simple comparison: if number of rows increased
        if (currentData.length > previousData.length) {
          for (let i = previousData.length; i < currentData.length; i++) {
            newRowIndices.push(i);
          }
        } else {
          // Check for changes in existing rows (simplified)
          for (let i = 0; i < Math.min(currentData.length, previousData.length); i++) {
            if (JSON.stringify(currentData[i]) !== JSON.stringify(previousData[i])) {
              newRowIndices.push(i);
            }
          }
        }
        
        if (newRowIndices.length > 0) {
          setNewRows(newRowIndices);
          // Clear highlight after 3 seconds
          setTimeout(() => {
            setNewRows([]);
          }, 3000);
        }
      }
      
      previousDataRef.current = currentData;
      setHeaders(rows[0]);
      setData(currentData);
      setFilteredData(currentData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Setup auto-refresh interval
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData();
      }, 5000); // 5 seconds
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(row =>
        row.some(cell =>
          cell.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, data]);

  const handleManualRefresh = () => {
    fetchData();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  if (loading) return (
    <div>
      <Navbar />
      <div style={styles.center}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading initial data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div>
      <Navbar />
      <div style={styles.center}>Error: {error}</div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.headerSection}>
          <h2 style={styles.title}>Daily Collection Report</h2>
          
          <div style={styles.statusBar}>
            <div style={styles.statusLeft}>
              {isRefreshing ? (
                <div style={styles.refreshingIndicator}>
                  <div style={styles.spinnerSmall}></div>
                  <span style={styles.refreshingText}>Refreshing data...</span>
                </div>
              ) : lastUpdated && (
                <div style={styles.lastUpdated}>
                  <span style={styles.updateIcon}>🕒</span>
                  <span style={styles.lastUpdatedText}>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            
            <div style={styles.autoRefreshControls}>
              <button 
                onClick={toggleAutoRefresh}
                style={autoRefresh ? styles.autoRefreshBtnOn : styles.autoRefreshBtnOff}
              >
                <span style={styles.btnIcon}>
                  {autoRefresh ? "⏸️" : "▶️"}
                </span>
                <span style={styles.btnText}>Auto-refresh: {autoRefresh ? "ON" : "OFF"}</span>
              </button>
              
              <button 
                onClick={handleManualRefresh}
                style={styles.refreshBtn}
                disabled={isRefreshing}
              >
                <span style={styles.btnIcon}>🔄</span>
                <span style={styles.btnText}>Refresh Now</span>
              </button>
            </div>
          </div>
          
          <div style={styles.controls}>
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search in table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              <span style={styles.searchIcon}>🔍</span>
            </div>
            <div style={styles.stats}>
              <span style={styles.statItem}>
                Total Records: <strong style={styles.statStrong}>{filteredData.length}</strong>
              </span>
              <span style={styles.statItem}>
                Total Columns: <strong style={styles.statStrong}>{headers.length}</strong>
              </span>
              <span style={styles.statItem}>
                Auto-refresh: <strong style={autoRefresh ? styles.statStrongOn : styles.statStrongOff}>
                  {autoRefresh ? "5s" : "Off"}
                </strong>
              </span>
            </div>
          </div>
        </div>
        
        {newRows.length > 0 && (
          <div style={styles.updateNotification}>
            <span style={styles.updateNotificationIcon}>📊</span>
            <span style={styles.updateNotificationText}>{newRows.length} row(s) updated</span>
          </div>
        )}
        
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} style={styles.th}>
                    <span style={styles.headerText}>{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr 
                  key={i} 
                  style={{
                    ...(i % 2 === 0 ? styles.rowEven : styles.rowOdd),
                    ...(newRows.includes(i) ? styles.newRow : {})
                  }}
                >
                  {row.map((cell, j) => (
                    <td key={j} style={styles.td}>
                      <strong style={styles.cellText}>{cell}</strong>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div style={styles.noResults}>
              <strong style={styles.noResultsText}>No matching records found</strong>
            </div>
          )}
        </div>
        
        <div style={styles.footer}>
          <p style={styles.footerText}>
            <strong>Paisaonsalry &copy; {new Date().getFullYear()} | Daily Collection Management System | Data auto-refreshes every 5 seconds</strong>
          </p>
        </div>
      </div>
      
      {/* Global Styles */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes highlightRow {
            0% { background: linear-gradient(90deg, #fef3c7 0%, #fde68a 100%); }
            100% { background: inherit; }
          }
          @keyframes slideDown {
            0% { transform: translateY(-10px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          
          /* Button hover effects */
          button {
            transition: all 0.3s ease !important;
          }
          
          button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
          }
          
          /* Navigation hover effects */
          [style*="navLink"]:not([style*="navLinkActive"]):hover {
            background: rgba(255, 255, 255, 0.1) !important;
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  // Navbar Styles
  navbar: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    color: "white",
    padding: "0 20px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 0",
  },
  logoContainer: {
    display: "flex",
    flexDirection: "column",
  },
  companyName: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "bold",
    background: "linear-gradient(90deg, #ffffff, #dbeafe)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "0.5px",
  },
  tagline: {
    fontSize: "14px",
    opacity: 0.8,
    marginTop: "4px",
    fontWeight: "500",
  },
  navLinks: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
  },
  navLink: {
    color: "#dbeafe",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
    padding: "10px 15px",
    borderRadius: "6px",
    transition: "all 0.3s ease",
  },
  navLinkActive: {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600",
    padding: "10px 15px",
    borderRadius: "6px",
    background: "rgba(255, 255, 255, 0.15)",
    transition: "all 0.3s ease",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
  },
  profileBtn: {
    background: "rgba(255, 255, 255, 0.15)",
    border: "none",
    borderRadius: "50%",
    width: "45px",
    height: "45px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  profileIcon: {
    fontSize: "20px",
  },
  
  // Page Styles
  page: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f3f4f6",
    minHeight: "calc(100vh - 70px)",
  },
  
  // Header Section
  headerSection: {
    maxWidth: "1400px",
    margin: "0 auto 25px auto",
  },
  title: {
    textAlign: "center",
    marginBottom: "15px",
    color: "#1e3a8a",
    fontSize: "32px",
    fontWeight: "bold",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  
  // Status Bar
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "15px 25px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },
  statusLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  refreshingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#f59e0b",
    fontWeight: "600",
  },
  refreshingText: {
    fontSize: "16px",
    fontWeight: "600",
  },
  lastUpdated: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#6b7280",
  },
  lastUpdatedText: {
    fontSize: "16px",
    fontWeight: "600",
  },
  updateIcon: {
    fontSize: "18px",
  },
  
  // Auto Refresh Controls
  autoRefreshControls: {
    display: "flex",
    gap: "15px",
  },
  autoRefreshBtnOn: {
    padding: "12px 20px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "600",
    fontSize: "15px",
    transition: "all 0.3s ease",
  },
  autoRefreshBtnOff: {
    padding: "12px 20px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "600",
    fontSize: "15px",
    transition: "all 0.3s ease",
  },
  refreshBtn: {
    padding: "12px 20px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "600",
    fontSize: "15px",
    transition: "all 0.3s ease",
  },
  btnIcon: {
    fontSize: "16px",
  },
  btnText: {
    fontSize: "15px",
    fontWeight: "600",
  },
  
  // Controls
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "20px",
  },
  searchContainer: {
    position: "relative",
    flex: 1,
    maxWidth: "450px",
  },
  searchInput: {
    width: "100%",
    padding: "14px 45px 14px 20px",
    borderRadius: "25px",
    border: "2px solid #e5e7eb",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s ease",
    fontWeight: "500",
  },
  searchIcon: {
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
    fontSize: "18px",
  },
  stats: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
  },
  statItem: {
    fontSize: "16px",
    color: "#4b5563",
    fontWeight: "500",
  },
  statStrong: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#1e3a8a",
  },
  statStrongOn: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#10b981",
  },
  statStrongOff: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#ef4444",
  },
  
  // Update Notification
  updateNotification: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    padding: "12px 25px",
    borderRadius: "8px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    animation: "slideDown 0.5s ease",
    maxWidth: "1400px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  updateNotificationIcon: {
    fontSize: "20px",
  },
  updateNotificationText: {
    fontSize: "16px",
    fontWeight: "600",
  },
  
  // New Row Highlight
  newRow: {
    animation: "highlightRow 3s ease",
    background: "linear-gradient(90deg, #fef3c7 0%, #fde68a 100%) !important",
  },
  
  // Table Styles with Larger Font and Bold
  tableWrap: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    maxWidth: "1400px",
    margin: "0 auto",
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },
  th: {
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    color: "#fff",
    padding: "16px 14px",
    border: "1px solid #2d4fc8",
    position: "sticky",
    top: 0,
    textAlign: "left",
    verticalAlign: "middle",
  },
  headerText: {
    fontSize: "18px",
    fontWeight: "bold",
    letterSpacing: "0.5px",
    display: "block",
  },
  td: {
    padding: "14px",
    border: "1px solid #e5e7eb",
    verticalAlign: "middle",
  },
  cellText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    display: "block",
  },
  rowEven: {
    background: "#f8fafc",
  },
  rowOdd: {
    background: "#ffffff",
  },
  
  // Loading Styles
  loadingSpinner: {
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #3b82f6",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  loadingText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#374151",
  },
  spinnerSmall: {
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #f59e0b",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    animation: "spin 1s linear infinite",
  },
  
  // No Results
  noResults: {
    textAlign: "center",
    padding: "50px",
  },
  noResultsText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#6b7280",
  },
  
  // Footer
  footer: {
    textAlign: "center",
    padding: "25px",
    marginTop: "40px",
    maxWidth: "1400px",
    margin: "40px auto 0 auto",
    borderTop: "2px solid #e5e7eb",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
  },
  footerText: {
    fontSize: "15px",
    color: "#4b5563",
    margin: 0,
  },
  
  // Center Loading/Error
  center: {
    textAlign: "center",
    padding: "40px",
    background: "#f3f4f6",
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
};