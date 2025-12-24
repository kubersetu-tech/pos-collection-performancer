import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileX,
  Printer,
  Mail,
  CloudDownload,
  Database,
  ArrowLeft,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  MoreVertical,
  User,
  Target,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';

const DataExporter = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [filters, setFilters] = useState({
    employee: '',
    status: '',
    minAmount: '',
    maxAmount: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([]);
  
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQclZvKpPugj7vtMuKG_I6UZ5QPzRRR-dKhRutTZ4xSz-PcKuP4DnoVNv85uoOTTnxxPh5s1tjvjD0q/pub?gid=1719907297&single=true&output=csv";

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("paisaonsalary_authenticated");
    if (!isLoggedIn || isLoggedIn !== "true") {
      navigate("/");
      return;
    }
    fetchData();
    
    // Load export history from localStorage
    const savedHistory = localStorage.getItem('exportHistory');
    if (savedHistory) {
      setExportHistory(JSON.parse(savedHistory));
    }
  }, []);

  const fetchData = () => {
    setLoading(true);
    Papa.parse(csvUrl, {
      download: true,
      skipEmptyLines: true,
      complete: (result) => {
        setData(result.data);
        setFilteredData(result.data.slice(1)); // Remove header for display
        setLoading(false);
      },
      error: (err) => {
        console.error("CSV Error:", err);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    applyFilters();
  }, [data, filters, searchTerm, dateRange]);

  const applyFilters = () => {
    if (!data.length) return;

    let result = data.slice(1); // Exclude header

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(row => 
        row.some(cell => 
          String(cell).toLowerCase().includes(term)
        )
      );
    }

    // Apply employee filter
    if (filters.employee) {
      result = result.filter(row => 
        String(row[0]).toLowerCase().includes(filters.employee.toLowerCase())
      );
    }

    // Apply status filter (assuming status is in column with %)
    if (filters.status) {
      result = result.filter(row => {
        const statusValue = row.find(cell => 
          String(cell).includes('%')
        );
        if (!statusValue) return false;
        const percentage = parseFloat(statusValue);
        if (filters.status === 'high') return percentage >= 80;
        if (filters.status === 'medium') return percentage >= 60 && percentage < 80;
        if (filters.status === 'low') return percentage < 60;
        return true;
      });
    }

    // Apply amount filters (assuming amount is in a column with numbers)
    if (filters.minAmount || filters.maxAmount) {
      const min = parseFloat(filters.minAmount) || 0;
      const max = parseFloat(filters.maxAmount) || Infinity;
      result = result.filter(row => {
        const amountCell = row.find(cell => {
          const str = String(cell);
          return /^\d+$/.test(str.replace(/,/g, '')) && str.length > 3;
        });
        if (!amountCell) return false;
        const amount = parseFloat(String(amountCell).replace(/,/g, ''));
        return amount >= min && amount <= max;
      });
    }

    setFilteredData(result);
  };

  const handleExport = async () => {
    if (filteredData.length === 0) return;
    
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      const headers = data[0] || [];
      const exportData = [headers, ...filteredData];
      
      // Simulate export progress
      const interval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 10;
        });
      }, 100);

      switch(exportFormat) {
        case 'csv':
          await exportToCSV(exportData);
          break;
        case 'excel':
          await exportToExcel(exportData);
          break;
        case 'json':
          await exportToJSON(exportData);
          break;
        case 'pdf':
          await exportToPDF(exportData);
          break;
        default:
          await exportToCSV(exportData);
      }

      clearInterval(interval);
      setExportProgress(100);

      // Add to export history
      const newExport = {
        id: Date.now(),
        date: new Date().toISOString(),
        format: exportFormat,
        rows: filteredData.length,
        filters: { ...filters, searchTerm }
      };
      
      const updatedHistory = [newExport, ...exportHistory.slice(0, 9)];
      setExportHistory(updatedHistory);
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToCSV = (data) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `paisaonsalary_export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data) => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PaisaOnSalary Data");
    
    // Auto-size columns
    const wscols = data[0].map((_, i) => ({ wch: 20 }));
    ws['!cols'] = wscols;
    
    XLSX.writeFile(wb, `paisaonsalary_export_${Date.now()}.xlsx`);
  };

  const exportToJSON = (data) => {
    const headers = data[0];
    const jsonData = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `paisaonsalary_export_${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async (data) => {
    // Simple PDF generation using html2pdf
    const content = `
      <h1>PaisaOnSalary Data Export</h1>
      <p>Exported on: ${new Date().toLocaleString()}</p>
      <p>Total Records: ${data.length - 1}</p>
      <table border="1" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            ${data[0].map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.slice(1, 51).map(row => `
            <tr>
              ${row.map(cell => `<td>${cell}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${data.length > 51 ? `<p>... and ${data.length - 51} more records</p>` : ''}
    `;

    // Create and download HTML file for now
    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `paisaonsalary_export_${Date.now()}.html`);
    link.click();
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map((_, index) => index));
    }
  };

  const handleRowSelect = (index) => {
    setSelectedRows(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      employee: '',
      status: '',
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setSelectedRows([]);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (row) => {
    const statusCell = row.find(cell => String(cell).includes('%'));
    if (!statusCell) return 'gray';
    const percentage = parseFloat(statusCell);
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    return 'red';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading export data...</p>
      </div>
    );
  }

  const headers = data[0] || [];
  const totalRows = data.length - 1;
  const filteredRows = filteredData.length;
  const selectedCount = selectedRows.length;

  return (
    <div className="exporter-container">
      {/* Header */}
      <header className="exporter-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="header-title">
            <h1>
              <Database size={24} />
              Data Export Center
            </h1>
            <p className="subtitle">
              Export and manage your performance data from Google Sheets
            </p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <FileText size={16} />
            </div>
            <div>
              <span className="stat-label">Total Records</span>
              <span className="stat-value">{totalRows.toLocaleString()}</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Filter size={16} />
            </div>
            <div>
              <span className="stat-label">Filtered</span>
              <span className="stat-value">{filteredRows.toLocaleString()}</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <CheckCircle size={16} />
            </div>
            <div>
              <span className="stat-label">Selected</span>
              <span className="stat-value">{selectedCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="exporter-content">
        {/* Left Panel - Export Controls */}
        <div className="left-panel">
          <div className="export-controls-card">
            <h2 className="card-title">
              <CloudDownload size={20} />
              Export Settings
            </h2>
            
            <div className="control-group">
              <label>Export Format</label>
              <div className="format-buttons">
                <button
                  className={`format-btn ${exportFormat === 'csv' ? 'active' : ''}`}
                  onClick={() => setExportFormat('csv')}
                >
                  <FileText size={16} />
                  CSV
                </button>
                <button
                  className={`format-btn ${exportFormat === 'excel' ? 'active' : ''}`}
                  onClick={() => setExportFormat('excel')}
                >
                  <FileSpreadsheet size={16} />
                  Excel
                </button>
                <button
                  className={`format-btn ${exportFormat === 'json' ? 'active' : ''}`}
                  onClick={() => setExportFormat('json')}
                >
                  <FileJson size={16} />
                  JSON
                </button>
                <button
                  className={`format-btn ${exportFormat === 'pdf' ? 'active' : ''}`}
                  onClick={() => setExportFormat('pdf')}
                >
                  <FileX size={16} />
                  PDF/HTML
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Export Range</label>
              <div className="range-selector">
                <select 
                  value={selectedCount === 0 ? 'all' : 'selected'}
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setSelectedRows([]);
                    }
                  }}
                >
                  <option value="all">All Filtered Records ({filteredRows})</option>
                  <option value="selected" disabled={selectedCount === 0}>
                    Selected Records Only ({selectedCount})
                  </option>
                </select>
              </div>
            </div>

            <div className="control-group">
              <label>Include Columns</label>
              <div className="columns-selector">
                <div className="columns-list">
                  {headers.map((header, index) => (
                    <div key={index} className="column-item">
                      <input
                        type="checkbox"
                        id={`col-${index}`}
                        defaultChecked
                        disabled={index === 0} // Keep first column (name) always checked
                      />
                      <label htmlFor={`col-${index}`}>
                        {header || `Column ${index + 1}`}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="export-actions">
              <button
                className="export-btn-primary"
                onClick={handleExport}
                disabled={isExporting || filteredRows === 0}
              >
                {isExporting ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    Exporting ({exportProgress}%)
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export {filteredRows.toLocaleString()} Records as {exportFormat.toUpperCase()}
                  </>
                )}
              </button>
              
              {isExporting && (
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              )}

              <div className="secondary-actions">
                <button className="action-btn">
                  <Printer size={16} />
                  Print Preview
                </button>
                <button className="action-btn">
                  <Mail size={16} />
                  Email Export
                </button>
                <button className="action-btn" onClick={clearFilters}>
                  <XCircle size={16} />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Export History */}
          <div className="history-card">
            <h2 className="card-title">
              <Calendar size={20} />
              Export History
            </h2>
            <div className="history-list">
              {exportHistory.length === 0 ? (
                <p className="no-history">No export history yet</p>
              ) : (
                exportHistory.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-icon">
                      {item.format === 'csv' && <FileText size={14} />}
                      {item.format === 'excel' && <FileSpreadsheet size={14} />}
                      {item.format === 'json' && <FileJson size={14} />}
                      {item.format === 'pdf' && <FileX size={14} />}
                    </div>
                    <div className="history-details">
                      <div className="history-header">
                        <span className="history-format">{item.format.toUpperCase()}</span>
                        <span className="history-date">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="history-info">
                        {item.rows} records exported
                      </p>
                      {item.filters.searchTerm && (
                        <span className="history-filter">
                          Filter: {item.filters.searchTerm}
                        </span>
                      )}
                    </div>
                    <button className="history-action">
                      <Download size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Data Preview and Filters */}
        <div className="right-panel">
          {/* Filters Bar */}
          <div className="filters-bar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search in all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <XCircle size={14} />
                </button>
              )}
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label>Employee</label>
                <input
                  type="text"
                  placeholder="Filter by name"
                  value={filters.employee}
                  onChange={(e) => setFilters({...filters, employee: e.target.value})}
                />
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">All Status</option>
                  <option value="high">High (≥80%)</option>
                  <option value="medium">Medium (60-79%)</option>
                  <option value="low">Low (&lt;60%)</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Amount Range</label>
                <div className="amount-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                  />
                </div>
              </div>

              <button 
                className="refresh-data"
                onClick={fetchData}
                title="Refresh data from Google Sheets"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Data Preview */}
          <div className="data-preview-card">
            <div className="preview-header">
              <h3>Data Preview</h3>
              <div className="preview-info">
                <span>
                  Showing {filteredRows} of {totalRows} records
                </span>
                <button 
                  className="select-all-btn"
                  onClick={handleSelectAll}
                >
                  {selectedRows.length === filteredRows && filteredRows > 0 
                    ? 'Deselect All' 
                    : 'Select All'}
                </button>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="select-col">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === filteredRows && filteredRows > 0}
                        onChange={handleSelectAll}
                        disabled={filteredRows === 0}
                      />
                    </th>
                    {headers.map((header, index) => (
                      <th key={index}>
                        <div className="header-content">
                          {header || `Column ${index + 1}`}
                          <ChevronDown size={12} />
                        </div>
                      </th>
                    ))}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 100).map((row, rowIndex) => {
                    const isSelected = selectedRows.includes(rowIndex);
                    const statusColor = getStatusColor(row);
                    
                    return (
                      <tr key={rowIndex} className={isSelected ? 'selected' : ''}>
                        <td className="select-col">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRowSelect(rowIndex)}
                          />
                        </td>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>
                            <div className="cell-content">
                              {cellIndex === 0 ? (
                                <div className="employee-cell">
                                  <User size={12} />
                                  <span>{cell}</span>
                                </div>
                              ) : (
                                cell
                              )}
                            </div>
                          </td>
                        ))}
                        {/* Fill empty cells if row has less columns than headers */}
                        {Array.from({ length: Math.max(0, headers.length - row.length) }).map((_, i) => (
                          <td key={`empty-${i}`}>-</td>
                        ))}
                        <td>
                          <div className={`status-badge status-${statusColor}`}>
                            {statusColor === 'green' && <CheckCircle size={12} />}
                            {statusColor === 'yellow' && <AlertCircle size={12} />}
                            {statusColor === 'red' && <XCircle size={12} />}
                            <span>
                              {statusColor === 'green' ? 'Good' : 
                               statusColor === 'yellow' ? 'Average' : 'Needs Improvement'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredRows > 100 && (
                <div className="preview-footer">
                  <p>
                    Showing first 100 of {filteredRows} records. 
                    Export to see all records.
                  </p>
                </div>
              )}

              {filteredRows === 0 && (
                <div className="no-data">
                  <AlertCircle size={48} />
                  <p>No data matches your filters</p>
                  <button onClick={clearFilters}>Clear Filters</button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Export Cards */}
          <div className="quick-export-grid">
            <div className="quick-card">
              <div className="quick-icon" style={{ background: '#3b82f6' }}>
                <User size={24} />
              </div>
              <div className="quick-content">
                <h4>Employee Performance</h4>
                <p>Export performance metrics by employee</p>
              </div>
              <button className="quick-btn">
                <Download size={16} />
              </button>
            </div>

            <div className="quick-card">
              <div className="quick-icon" style={{ background: '#10b981' }}>
                <Target size={24} />
              </div>
              <div className="quick-content">
                <h4>Target Achievement</h4>
                <p>Export target vs achievement reports</p>
              </div>
              <button className="quick-btn">
                <Download size={16} />
              </button>
            </div>

            <div className="quick-card">
              <div className="quick-icon" style={{ background: '#f59e0b' }}>
                <DollarSign size={24} />
              </div>
              <div className="quick-content">
                <h4>Revenue Reports</h4>
                <p>Export financial data and collections</p>
              </div>
              <button className="quick-btn">
                <Download size={16} />
              </button>
            </div>

            <div className="quick-card">
              <div className="quick-icon" style={{ background: '#8b5cf6' }}>
                <BarChart3 size={24} />
              </div>
              <div className="quick-content">
                <h4>Analytics Data</h4>
                <p>Export charts and analytics data</p>
              </div>
              <button className="quick-btn">
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .exporter-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 1rem;
        }

        .exporter-header {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f1f5f9;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: #64748b;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: #e2e8f0;
          color: #475569;
        }

        .header-title h1 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #1e293b;
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .subtitle {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
        }

        .header-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.125rem;
        }

        .stat-value {
          display: block;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
        }

        .exporter-content {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 1.5rem;
          height: calc(100vh - 140px);
        }

        .left-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow-y: auto;
        }

        .export-controls-card,
        .history-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #1e293b;
          font-size: 1.125rem;
          margin-bottom: 1.5rem;
        }

        .control-group {
          margin-bottom: 1.5rem;
        }

        .control-group label {
          display: block;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .format-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .format-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .format-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .format-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .range-selector select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #1e293b;
          font-size: 0.875rem;
        }

        .columns-selector {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .columns-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .column-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .column-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }

        .column-item label {
          font-size: 0.875rem;
          color: #475569;
          margin: 0;
          cursor: pointer;
        }

        .export-actions {
          margin-top: 2rem;
        }

        .export-btn-primary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .export-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .export-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .progress-container {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          margin-top: 1rem;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .secondary-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          color: #475569;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: #e2e8f0;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .history-item:hover {
          background: #f1f5f9;
        }

        .history-icon {
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .history-details {
          flex: 1;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .history-format {
          font-size: 0.75rem;
          font-weight: 600;
          color: #1e293b;
          padding: 0.125rem 0.5rem;
          background: #e2e8f0;
          border-radius: 4px;
        }

        .history-date {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .history-info {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        .history-filter {
          display: inline-block;
          font-size: 0.7rem;
          color: #f59e0b;
          background: #fef3c7;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          margin-top: 0.25rem;
        }

        .history-action {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .history-action:hover {
          color: #3b82f6;
          background: #f1f5f9;
        }

        .no-history {
          text-align: center;
          color: #94a3b8;
          font-size: 0.875rem;
          padding: 2rem 0;
        }

        .right-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow-y: auto;
        }

        .filters-bar {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .search-box {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-box svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-box input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.875rem;
          color: #1e293b;
          transition: all 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
        }

        .clear-search:hover {
          color: #ef4444;
        }

        .filter-controls {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
        }

        .filter-group input,
        .filter-group select {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #1e293b;
          background: white;
        }

        .filter-group input:focus,
        .filter-group select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .amount-range {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .amount-range input {
          width: 80px;
        }

        .amount-range span {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .refresh-data {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
          align-self: flex-end;
        }

        .refresh-data:hover {
          background: #e2e8f0;
          color: #3b82f6;
        }

        .data-preview-card {
          flex: 1;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }

        .preview-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .preview-header h3 {
          color: #1e293b;
          font-size: 1rem;
          margin: 0;
        }

        .preview-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .preview-info span {
          font-size: 0.875rem;
          color: #64748b;
        }

        .select-all-btn {
          background: transparent;
          border: none;
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .select-all-btn:hover {
          background: #f1f5f9;
        }

        .table-container {
          flex: 1;
          overflow: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }

        thead {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #f8fafc;
        }

        th {
          padding: 1rem;
          text-align: left;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .select-col {
          width: 40px;
          text-align: center;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.875rem;
          color: #475569;
        }

        tr:hover td {
          background: #f8fafc;
        }

        tr.selected td {
          background: #eff6ff;
        }

        .cell-content {
          display: flex;
          align-items: center;
        }

        .employee-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #1e293b;
          font-weight: 500;
        }

        .employee-cell svg {
          color: #94a3b8;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-green {
          background: #dcfce7;
          color: #10b981;
        }

        .status-yellow {
          background: #fef3c7;
          color: #f59e0b;
        }

        .status-red {
          background: #fee2e2;
          color: #ef4444;
        }

        .status-gray {
          background: #f1f5f9;
          color: #64748b;
        }

        .preview-footer {
          padding: 1rem;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }

        .preview-footer p {
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0;
        }

        .no-data {
          padding: 3rem;
          text-align: center;
          color: #94a3b8;
        }

        .no-data svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-data p {
          margin-bottom: 1rem;
        }

        .no-data button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .quick-export-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .quick-card {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .quick-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .quick-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .quick-content {
          flex: 1;
        }

        .quick-content h4 {
          color: #1e293b;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .quick-content p {
          color: #64748b;
          font-size: 0.75rem;
          margin: 0;
        }

        .quick-btn {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .quick-btn:hover {
          background: #e2e8f0;
          color: #3b82f6;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 1rem;
        }

        .loading-container .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 1400px) {
          .exporter-content {
            grid-template-columns: 340px 1fr;
          }
          
          .quick-export-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 1200px) {
          .exporter-content {
            grid-template-columns: 1fr;
            height: auto;
          }
          
          .left-panel {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
        }

        @media (max-width: 992px) {
          .filter-controls {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .header-stats {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .left-panel {
            grid-template-columns: 1fr;
          }
          
          .format-buttons {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .secondary-actions {
            grid-template-columns: 1fr;
          }
          
          .quick-export-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 576px) {
          .filter-controls {
            grid-template-columns: 1fr;
          }
          
          .format-buttons {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default DataExporter;