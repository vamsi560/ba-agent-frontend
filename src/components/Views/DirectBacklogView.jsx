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
                <div 
                    className="glass-panel upload-zone-large slide-up" 
                    style={{ 
                        marginTop: '3rem', 
                        textAlign: 'center', 
                        padding: '5rem 3rem',
                        background: 'linear-gradient(145deg, rgba(15,23,42,0.6) 0%, rgba(30,41,59,0.4) 100%)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                        borderRadius: '24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Glowing background orb */}
                    <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }}></div>
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <UploadCloud size={72} style={{ color: 'var(--primary)', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.5))' }} />
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #a5d6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Drag & Drop your BRD here</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Supports PDF, DOCX, TXT</p>
                    
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
                <div className="loading-state glass-panel pulse" style={{ marginTop: '3rem', padding: '5rem', textAlign: 'center', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <Loader2 className="spinner" size={64} style={{ color: 'var(--primary)', margin: '0 auto 2rem', filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.8))' }} />
                    <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>Analyzing Requirements & Architecting Backlog...</h3>
                    <p style={{ color: 'var(--primary)', opacity: 0.8 }}>Bypassing deep analysis phase for maximum velocity.</p>
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
