import React, { useState } from 'react';
import { UploadCloud, CheckCircle, FileText, Loader2, ListTree, Code2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://ba-agent-aqd8c3d8dtdrbcat.centralus-01.azurewebsites.net'
);

const DirectBacklogView = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('backlog');

    const handleFileUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE}/generate-backlog-direct`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to generate backlog");
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="view-container slide-in">
            <div className="view-header">
                <h2>Quick Backlog Generator</h2>
                <p>Upload a raw Business Requirements Document (BRD) to instantly generate an ADO hierarchy and Test Cases.</p>
            </div>

            {!result && !loading && (
                <div className="glass-panel upload-zone-large" style={{ marginTop: '2rem', textAlign: 'center', padding: '4rem 2rem' }}>
                    <UploadCloud size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <h3>Drag & Drop your BRD here</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Supports PDF, DOCX, TXT</p>
                    
                    <input 
                        type="file" 
                        id="direct-file-upload" 
                        style={{ display: 'none' }} 
                        onChange={handleFileUpload} 
                        accept=".pdf,.txt,.docx"
                    />
                    <label htmlFor="direct-file-upload" className="primary-button" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                        Browse Files
                    </label>

                    {file && (
                        <div style={{ marginTop: '2rem' }}>
                            <div className="file-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', padding: '0.5rem 1rem', borderRadius: '50px', color: 'var(--primary)' }}>
                                <FileText size={16} />
                                {file.name}
                                <CheckCircle size={16} />
                            </div>
                            <div style={{ marginTop: '1.5rem' }}>
                                <button className="primary-button" onClick={handleGenerate}>
                                    Generate Backlog & Tests
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {loading && (
                <div className="loading-state glass-panel" style={{ marginTop: '2rem', padding: '4rem', textAlign: 'center' }}>
                    <Loader2 className="spinner" size={48} style={{ color: 'var(--primary)', margin: '0 auto 1.5rem' }} />
                    <h3>Analyzing Requirements & Architecting Backlog...</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>This bypasses the deep gap analysis for maximum speed.</p>
                </div>
            )}

            {result && !loading && (
                <div className="result-container slide-up" style={{ marginTop: '2rem' }}>
                    <div className="tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                        <button 
                            className={`tab-btn ${activeTab === 'backlog' ? 'active' : ''}`}
                            onClick={() => setActiveTab('backlog')}
                            style={{ background: 'none', border: 'none', color: activeTab === 'backlog' ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '1.1rem', cursor: 'pointer', fontWeight: activeTab === 'backlog' ? '600' : '400', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <ListTree size={20} /> ADO Backlog
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tests')}
                            style={{ background: 'none', border: 'none', color: activeTab === 'tests' ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '1.1rem', cursor: 'pointer', fontWeight: activeTab === 'tests' ? '600' : '400', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Code2 size={20} /> QA Test Cases
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'backlog' && (
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3>Generated Hierarchy</h3>
                                <div className="json-tree" style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem', overflowX: 'auto' }}>
                                    <pre style={{ margin: 0, color: '#a5d6ff', fontSize: '0.9rem' }}>
                                        {JSON.stringify(result.backlog, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tests' && (
                            <div className="glass-panel markdown-body" style={{ padding: '2rem' }}>
                                {typeof result.test_cases === 'string' ? (
                                    <ReactMarkdown>{result.test_cases}</ReactMarkdown>
                                ) : (
                                    <pre style={{ margin: 0, color: '#a5d6ff', fontSize: '0.9rem' }}>
                                        {JSON.stringify(result.test_cases, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button className="secondary-button" onClick={() => { setResult(null); setFile(null); }}>
                            Start Over
                        </button>
                        <button className="primary-button" onClick={() => alert("Publish to ADO feature is coming soon!")}>
                            Publish to Azure DevOps
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DirectBacklogView;
