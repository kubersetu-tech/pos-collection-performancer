import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import { 
  Lock, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  Menu, 
  X, 
  Users,
  Calendar,
  Home,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

const EmployeeCollectionPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const navigate = useNavigate();
  
  // Authentication check
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("paisaonsalary_authenticated");
    if (!isLoggedIn || isLoggedIn !== "true") {
      navigate("/");
    }
  }, [navigate]);

  const csvUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQclZvKpPugj7vtMuKG_I6UZ5QPzRRR-dKhRutTZ4xSz-PcKuP4DnoVNv85uoOTTnxxPh5s1tjvjD0q/pub?gid=1719907297&single=true&output=csv";

  const intervalRef = useRef(null);

  // Fetch data function
  const fetchData = () => {
    setLoading(true);
    Papa.parse(`${csvUrl}&t=${Date.now()}`, {
      download: true,
      skipEmptyLines: true,
      complete: (result) => {
        setData(result.data);
        setLoading(false);
        setLastUpdated(new Date());
      },
      error: () => setLoading(false),
    });
  };

  // Initial fetch and auto-update setup
  useEffect(() => {
    fetchData();
    
    intervalRef.current = setInterval(() => {
      fetchData();
    }, 1000000); // 10 seconds
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    const headers = data[0] || [];
    const rows = data.slice(1) || [];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employee_collection_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    if (!data.length) return [];
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let filtered = rows;
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(row => 
        row.some(cell => 
          String(cell).toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Apply sorting
    if (sortConfig.key !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Try to parse as number first
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
        }
        
        // Fall back to string comparison
        const aStr = String(aValue || '');
        const bStr = String(bValue || '');
        
        if (sortConfig.direction === 'ascending') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }
    
    return [headers, ...filtered];
  }, [data, searchTerm, sortConfig]);

  // Calculate pagination
  const totalRows = filteredData.length > 0 ? filteredData.length - 1 : 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const endRow = startRow + rowsPerPage;
  
  const displayedData = filteredData.length > 0 
    ? [filteredData[0], ...filteredData.slice(1).slice(startRow, endRow)]
    : [];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Modern Loading Component
  if (loading && data.length === 0) return (
    <div className="modern-loading">
      <div className="loading-wrapper">
        {/* Animated background elements */}
        <div className="loading-background">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>
        
        {/* Main loader */}
        <div className="loading-content">
          {/* Logo animation */}
          <div className="loading-logo">
            <div className="logo-pulse">
              <Users size={48} className="logo-icon" />
            </div>
            <div className="logo-ring"></div>
          </div>
          
          {/* Company name with typing animation */}
          <div className="company-name-loader">
            <h1 className="typing-text">PaisaOnSalary</h1>
            <div className="typing-cursor"></div>
          </div>
          
          {/* Loading text with dots animation */}
          <div className="loading-text">
            <p className="loading-title">Loading Employee Collection Data</p>
            <p className="loading-subtitle">Fetching real-time data from Google Sheets</p>
          </div>
          
          {/* Progress indicator */}
          <div className="progress-container">
            <div className="progress-track">
              <div className="progress-fill">
                <div className="progress-shimmer"></div>
              </div>
            </div>
            <div className="progress-dots">
              <div className="dot dot-1"></div>
              <div className="dot dot-2"></div>
              <div className="dot dot-3"></div>
              <div className="dot dot-4"></div>
              <div className="dot dot-5"></div>
            </div>
          </div>
          
          {/* Stats preview skeleton */}
          <div className="stats-preview">
            <div className="stat-preview-card">
              <div className="preview-icon skeleton"></div>
              <div className="preview-content">
                <div className="skeleton skeleton-text" style={{width: '80px'}}></div>
                <div className="skeleton skeleton-value" style={{width: '60px'}}></div>
              </div>
            </div>
            <div className="stat-preview-card">
              <div className="preview-icon skeleton"></div>
              <div className="preview-content">
                <div className="skeleton skeleton-text" style={{width: '100px'}}></div>
                <div className="skeleton skeleton-value" style={{width: '80px'}}></div>
              </div>
            </div>
            <div className="stat-preview-card">
              <div className="preview-icon skeleton"></div>
              <div className="preview-content">
                <div className="skeleton skeleton-text" style={{width: '90px'}}></div>
                <div className="skeleton skeleton-value" style={{width: '70px'}}></div>
              </div>
            </div>
          </div>
          
          {/* Loading hint */}
          <div className="loading-hint">
            <RefreshCw size={16} className="spin-slow" />
            <span>Auto-updating every 10 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );

  const headers = displayedData[0] || [];
  const rows = displayedData.slice(1) || [];

  return (
    <div className="employee-collection-container">
      {/* Refreshing Overlay */}
      {loading && data.length > 0 && (
        <div className="refreshing-overlay">
          <div className="refreshing-spinner">
            <RefreshCw size={24} className="spinning" />
            <span>Updating data...</span>
          </div>
        </div>
      )}

      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <div className="navbar-left">
          <button 
            className="menu-toggle" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="company-brand">
            <div className="company-logo">
              <Users size={32} />
            </div>
            <div>
              <h1 className="company-name">Employee Collection</h1>
              <p className="company-tagline">Detailed Performance Data</p>
            </div>
          </div>
        </div>
        
        <div className="navbar-right">
          <div className="update-controls">
            <button 
              className="refresh-btn"
              onClick={handleRefresh}
              title="Refresh Data"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
            
            <button 
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem("paisaonsalary_authenticated");
                localStorage.removeItem("paisaonsalary_auth_time");
                navigate("/");
              }}
              title="Logout"
            >
              <Lock size={18} />
              <span>Logout</span>
            </button>
            
            <button 
              className="back-btn"
              onClick={() => navigate("/dashboard")}
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
              <span>Dashboard</span>
            </button>
          </div>
          
          <div className="date-display">
            <Calendar size={16} />
            <div>
              <span>{new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
              <span className="time-display">{formatTime(lastUpdated)}</span>
            </div>
          </div>
          
          <button className="export-btn" onClick={handleExportCSV}>
            <Download size={18} />
            Export
          </button>
        </div>
      </nav>

      {/* ===== SIDEBAR ===== */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>PaisaOnSalary</h3>
          <p className="sidebar-subtitle">Navigation Menu</p>
        </div>
        <div className="sidebar-menu">
          <button 
            className="sidebar-item"
            onClick={() => {
              navigate("/dashboard");
              setSidebarOpen(false);
            }}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>
          <button 
            className="sidebar-item active"
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={20} />
            <span>Collection Data</span>
          </button>
        </div>
        
        <div className="sidebar-footer">
          <div className="stats-summary">
            <h4>Data Summary</h4>
            <div className="summary-item">
              <span>Total Rows</span>
              <span className="summary-value">{totalRows}</span>
            </div>
            <div className="summary-item">
              <span>Current Page</span>
              <span className="summary-value">{currentPage}/{totalPages}</span>
            </div>
            <div className="summary-item">
              <span>Last Updated</span>
              <span className="summary-value">{formatTime(lastUpdated)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        {/* Search and Controls */}
        <div className="controls-section">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search in table..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="action-buttons">
            <div className="rows-selector">
              <label>Show:</label>
              <select 
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rows-select"
              >
                <option value="10">10 rows</option>
                <option value="25">25 rows</option>
                <option value="50">50 rows</option>
                <option value="100">100 rows</option>
              </select>
            </div>
            
            <button 
              className="filter-btn"
              onClick={() => {
                // Filter functionality placeholder
                alert("Advanced filtering options coming soon!");
              }}
            >
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-container">
          <div className="table-header">
            <h2>📊 Employee Collection Performance</h2>
            <p>Complete dataset from Google Sheets • {totalRows} records</p>
          </div>
          
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th 
                      key={index}
                      onClick={() => handleSort(index)}
                      className="sortable-header"
                    >
                      <div className="header-content">
                        <strong>{header}</strong>
                        {sortConfig.key === index && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} className="no-data">
                      <div className="no-data-content">
                        <Search size={48} />
                        <p>No data found matching your search</p>
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm("")}
                            className="clear-search-btn"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even' : 'odd'}>
                      {row.map((cell, cellIndex) => {
                        const cellValue = String(cell).trim();
                        const isPercentage = cellValue.includes('%');
                        const isNumber = !isNaN(parseFloat(cellValue.replace(/[^0-9.-]/g, '')));
                        const isAmount = cellValue.includes('₹') || cellValue.includes('$') || cellValue.toLowerCase().includes('inr');
                        const isEmployeeName = cellIndex === 0 && cellValue && !isNumber && !isPercentage;
                        
                        return (
                          <td key={cellIndex}>
                            <div className="cell-content">
                              <div className={`cell-text ${isEmployeeName ? 'employee-name' : ''} ${isAmount ? 'amount' : ''} ${isPercentage ? 'percentage' : ''}`}>
                                <strong>{cell || '-'}</strong>
                              </div>
                              {isPercentage && (
                                <div className="percentage-indicator">
                                  <div 
                                    className="percentage-bar"
                                    style={{ 
                                      width: `${Math.min(parseFloat(cellValue.replace('%', '')), 100)}%`,
                                      backgroundColor: parseFloat(cellValue.replace('%', '')) >= 80 ? '#10b981' : 
                                                     parseFloat(cellValue.replace('%', '')) >= 60 ? '#f59e0b' : '#ef4444'
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalRows > 0 && (
            <div className="pagination-section">
              <div className="pagination-info">
                Showing <strong>{startRow + 1}</strong> to <strong>{Math.min(endRow, totalRows)}</strong> of <strong>{totalRows}</strong> rows
                {searchTerm && ` (filtered from ${data.length - 1} total rows)`}
              </div>
              
              <div className="pagination-controls">
                <button
                  className="pagination-btn first-page"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft size={18} />
                </button>
                
                <button
                  className="pagination-btn prev-page"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                  Prev
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        <strong>{pageNum}</strong>
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="page-dots">...</span>
                      <button
                        className="page-btn"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        <strong>{totalPages}</strong>
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  className="pagination-btn next-page"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
                
                <button
                  className="pagination-btn last-page"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight size={18} />
                </button>
              </div>
              
              <div className="rows-info">
                <select 
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rows-per-page-select"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        /* Container */
        .employee-collection-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Modern Loading Styles */
        .modern-loading {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          overflow: hidden;
        }
        
        .loading-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 800px;
          padding: 2rem;
        }
        
        .loading-background {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
        }
        
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .shape-1 {
          width: 200px;
          height: 200px;
          top: 10%;
          right: 10%;
          animation: float 20s infinite linear;
        }
        
        .shape-2 {
          width: 150px;
          height: 150px;
          bottom: 20%;
          left: 5%;
          animation: float 15s infinite linear reverse;
        }
        
        .shape-3 {
          width: 100px;
          height: 100px;
          top: 50%;
          right: 20%;
          animation: float 25s infinite linear;
        }
        
        .shape-4 {
          width: 80px;
          height: 80px;
          bottom: 10%;
          right: 30%;
          animation: float 18s infinite linear reverse;
        }
        
        .loading-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }
        
        .loading-logo {
          position: relative;
          width: 120px;
          height: 120px;
        }
        
        .logo-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        }
        
        .logo-icon {
          color: white;
        }
        
        .logo-ring {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1.5s linear infinite;
        }
        
        .company-name-loader {
          position: relative;
          display: flex;
          align-items: center;
          gap: 2px;
        }
        
        .typing-text {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
          background: linear-gradient(45deg, white, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
          animation: typing 2s steps(12) forwards;
        }
        
        .typing-cursor {
          width: 3px;
          height: 2.5rem;
          background: white;
          animation: blink 1s infinite;
          opacity: 0;
          animation-delay: 2s;
          animation-fill-mode: forwards;
        }
        
        .loading-text {
          text-align: center;
        }
        
        .loading-title {
          color: white;
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          font-weight: 500;
        }
        
        .loading-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          margin: 0;
        }
        
        .progress-container {
          width: 300px;
          max-width: 100%;
        }
        
        .progress-track {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .progress-fill {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, white, transparent);
          animation: shimmer 2s infinite;
          position: relative;
        }
        
        .progress-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shimmer 2s infinite;
        }
        
        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: dotPulse 1.4s infinite;
        }
        
        .dot-1 { animation-delay: 0s; }
        .dot-2 { animation-delay: 0.2s; }
        .dot-3 { animation-delay: 0.4s; }
        .dot-4 { animation-delay: 0.6s; }
        .dot-5 { animation-delay: 0.8s; }
        
        .stats-preview {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          opacity: 0;
          animation: fadeIn 0.5s forwards 1s;
        }
        
        .stat-preview-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 140px;
        }
        
        .preview-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.2);
        }
        
        .preview-content {
          flex: 1;
        }
        
        .skeleton {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          animation: skeletonPulse 1.5s infinite;
        }
        
        .skeleton-text {
          height: 12px;
          margin-bottom: 6px;
        }
        
        .skeleton-value {
          height: 20px;
        }
        
        .loading-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.75rem;
          margin-top: 1rem;
          opacity: 0;
          animation: fadeIn 0.5s forwards 1.5s;
        }
        
        .spin-slow {
          animation: spin 3s linear infinite;
        }

        /* Refreshing Overlay */
        .refreshing-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        
        .refreshing-spinner {
          background: white;
          padding: 1.5rem 2rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        
        .refreshing-spinner span {
          color: #1e293b;
          font-weight: 500;
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }

        /* Navbar */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.2);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .update-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .menu-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .menu-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .company-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .company-logo {
          background: rgba(255, 255, 255, 0.1);
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .company-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .company-tagline {
          font-size: 0.875rem;
          opacity: 0.9;
          margin: 0;
          font-weight: 400;
        }

        .refresh-btn, .back-btn, .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover, .back-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .logout-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #fecaca;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .date-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.75rem;
        }

        .time-display {
          display: block;
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          color: #1e3a8a;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 280px;
          background: white;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 999;
          padding-top: 80px;
          display: flex;
          flex-direction: column;
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .sidebar-header h3 {
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .sidebar-subtitle {
          color: #64748b;
          font-size: 0.75rem;
          margin: 0;
        }

        .sidebar-menu {
          flex: 1;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: none;
          background: transparent;
          color: #64748b;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          font-size: 0.875rem;
        }

        .sidebar-item:hover {
          background: #f1f5f9;
          color: #1e40af;
        }

        .sidebar-item.active {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .stats-summary {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 10px;
        }

        .stats-summary h4 {
          color: #1e293b;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .summary-item span:first-child {
          color: #64748b;
          font-weight: 500;
        }

        .summary-value {
          color: #1e293b;
          font-weight: 700;
          font-size: 0.9rem;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          padding: 2rem;
          margin-left: 0;
          transition: margin-left 0.3s ease;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .sidebar.open + .main-content {
          margin-left: 280px;
        }

        /* Controls Section */
        .controls-section {
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
        }

        .search-container {
          flex: 1;
          max-width: 500px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 3rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          background: #f8fafc;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
        }

        .clear-search:hover {
          color: #64748b;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rows-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .rows-select {
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        /* Table Container */
        .table-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .table-header {
          margin-bottom: 1.5rem;
        }

        .table-header h2 {
          color: #1e293b;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .table-header p {
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
        }

        .table-wrapper {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-bottom: 1.5rem;
          background: #f8fafc;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 100%;
        }

        .data-table th {
          background: #1e3a8a;
          padding: 1rem;
          text-align: left;
          font-weight: 700;
          color: white;
          font-size: 1rem;
          border-bottom: 3px solid #2563eb;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .sortable-header {
          cursor: pointer;
          transition: background-color 0.3s ease;
          padding: 1rem;
        }

        .sortable-header:hover {
          background: #2563eb;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sort-indicator {
          font-size: 1rem;
          color: white;
          font-weight: bold;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
          font-size: 1rem;
          font-weight: 600;
          background: white;
        }

        .data-table tr:hover td {
          background: #f0f9ff;
          color: #1e40af;
        }

        .data-table tr.even td {
          background: #f8fafc;
        }

        .data-table tr.even:hover td {
          background: #e8f4ff;
        }

        .cell-content {
          position: relative;
          padding: 0.25rem 0;
        }

        .cell-text {
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.4;
          min-height: 24px;
          display: flex;
          align-items: center;
        }

        .cell-text.employee-name {
          color: #1e3a8a;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .cell-text.amount {
          color: #10b981;
          font-weight: 700;
        }

        .cell-text.percentage {
          color: #3b82f6;
          font-weight: 700;
        }

        .percentage-indicator {
          margin-top: 0.5rem;
          width: 100%;
        }

        .percentage-bar {
          height: 6px;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .no-data {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
        }

        .no-data-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: #94a3b8;
        }

        .no-data-content p {
          font-size: 1.125rem;
          font-weight: 500;
          margin: 0;
        }

        .clear-search-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-search-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        /* Pagination */
        .pagination-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          border: 2px solid #e2e8f0;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-numbers {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .page-btn {
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .page-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
          border-color: #94a3b8;
        }

        .page-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
          font-weight: 700;
        }

        .page-dots {
          padding: 0.5rem;
          color: #94a3b8;
          font-size: 1rem;
          font-weight: 600;
        }

        .rows-per-page-select {
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .rows-per-page-select:hover {
          border-color: #94a3b8;
          background: #f8fafc;
        }

        /* Animations */
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, 20px) rotate(90deg);
          }
          50% {
            transform: translate(0, 40px) rotate(180deg);
          }
          75% {
            transform: translate(-20px, 20px) rotate(270deg);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0.7;
          }
          50% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0.7;
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes typing {
          0% {
            opacity: 0;
            width: 0;
          }
          100% {
            opacity: 1;
            width: 100%;
          }
        }
        
        @keyframes blink {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes dotPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        
        @keyframes skeletonPulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
          }
          
          .navbar-left, .navbar-right {
            width: 100%;
            justify-content: space-between;
          }
          
          .main-content {
            padding: 1rem;
          }
          
          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-container {
            max-width: 100%;
          }
          
          .pagination-section {
            flex-direction: column;
            gap: 1rem;
          }
          
          .data-table th {
            font-size: 0.875rem;
            padding: 0.75rem;
          }
          
          .data-table td {
            font-size: 0.875rem;
            padding: 0.75rem;
          }
          
          .cell-text {
            font-size: 0.875rem;
          }
          
          .cell-text.employee-name {
            font-size: 0.95rem;
          }
          
          /* Loading Responsive */
          .typing-text {
            font-size: 2rem;
          }
          
          .loading-title {
            font-size: 1.25rem;
          }
          
          .stats-preview {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .stat-preview-card {
            width: 120px;
          }
          
          .progress-container {
            width: 250px;
          }
        }

        @media (max-width: 480px) {
          .company-name {
            font-size: 1.25rem;
          }
          
          .data-table th {
            font-size: 0.75rem;
            padding: 0.5rem;
          }
          
          .data-table td {
            font-size: 0.75rem;
            padding: 0.5rem;
          }
          
          .cell-text {
            font-size: 0.75rem;
          }
          
          .cell-text.employee-name {
            font-size: 0.85rem;
          }
          
          /* Loading Responsive */
          .typing-text {
            font-size: 1.5rem;
          }
          
          .loading-logo {
            width: 80px;
            height: 80px;
          }
          
          .logo-pulse {
            width: 60px;
            height: 60px;
          }
          
          .stats-preview {
            flex-direction: column;
            align-items: center;
          }
          
          .stat-preview-card {
            width: 200px;
          }
          
          .shape-1, .shape-2 {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeCollectionPage;