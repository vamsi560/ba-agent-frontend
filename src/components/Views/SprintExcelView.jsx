import React, { useState } from 'react';
import { UploadCloud, CheckCircle, FileSpreadsheet, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://ba-agent-aqd8c3d8dtdrbcat.centralus-01.azurewebsites.net'
);

const SprintExcelView = () => {
    const [file, setFile] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleSync = async () => {
        if (!file) return;
        setIsSyncing(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE}/sync-sprint-excel`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || "Failed to sync Excel file");
            }
            
            setResult(data);
        } catch (error) {
            alert(`Sync Error: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="view-container slide-in">
            <div className="view-header">
                <h2>Sprint Planning Excel Sync</h2>
                <p>Upload your Sprint Planning Excel sheet to automatically update iteration paths, points, and states in Azure DevOps.</p>
            </div>

            <div 
                className="glass-panel slide-up" 
                style={{ 
                    marginTop: '3rem', 
                    textAlign: 'center', 
                    padding: '4rem 2rem',
                    background: 'linear-gradient(145deg, rgba(15,23,42,0.6) 0%, rgba(30,41,59,0.4) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '24px'
                }}
            >
                <FileSpreadsheet size={64} style={{ color: '#10b981', marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>Upload Sprint Excel</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Required Columns: "Work Item ID" or "ID"</p>
                
                <input 
                    type="file" 
                    id="excel-upload" 
                    style={{ display: 'none' }} 
                    onChange={handleFileUpload} 
                    accept=".xlsx,.xls"
                />
                <label htmlFor="excel-upload" className="btn-primary" style={{ display: 'inline-flex', cursor: 'pointer', background: 'var(--success)' }}>
                    Select Excel File
                </label>

                {file && (
                    <div className="slide-up" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
                            <CheckCircle size={20} color="#10b981" />
                            <strong>{file.name}</strong>
                        </div>
                        <button className="btn-primary" onClick={handleSync} disabled={isSyncing} style={{ padding: '0.8rem 2rem' }}>
                            {isSyncing ? <Loader2 className="spin" size={20} /> : '🔄 Sync to Azure DevOps'}
                        </button>
                    </div>
                )}

                {result && (
                    <div className="slide-up" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '12px', textAlign: 'left' }}>
                        <h4 style={{ color: '#10b981', marginTop: 0 }}>Sync Complete!</h4>
                        <p style={{ color: '#fff' }}>Successfully updated <strong>{result.updated_count}</strong> work items.</p>
                        
                        {result.errors && result.errors.length > 0 && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px' }}>
                                <h5 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>Errors ({result.errors.length})</h5>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#fca5a5', fontSize: '0.9rem' }}>
                                    {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SprintExcelView;
