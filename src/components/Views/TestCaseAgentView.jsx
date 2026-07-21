import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, RefreshCw, Send, CheckCircle } from 'lucide-react';
import TestCasesViewer from './TestCasesViewer';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://ba-agent-aqd8c3d8dtdrbcat.centralus-01.azurewebsites.net'
);

const TestCaseAgentView = () => {
    const [workItems, setWorkItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [testCasesMarkdown, setTestCasesMarkdown] = useState('');
    const [syncSuccess, setSyncSuccess] = useState(false);

    useEffect(() => {
        fetchWorkItems();
    }, []);

    const fetchWorkItems = async () => {
        setIsLoadingItems(true);
        try {
            const res = await fetch(`${API_BASE}/ado-work-items`);
            if (res.ok) {
                const data = await res.json();
                // Filter to Stories, Features, Tasks
                const validItems = data.filter(i => 
                    ['User Story', 'Feature', 'Bug', 'Task'].includes(i.type)
                );
                setWorkItems(validItems);
            }
        } catch (e) {
            console.error("Failed to fetch ADO items for QA", e);
        } finally {
            setIsLoadingItems(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedItem) return;
        setIsGenerating(true);
        setTestCasesMarkdown('');
        setSyncSuccess(false);

        try {
            const res = await fetch(`${API_BASE}/api/qa/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: selectedItem.id })
            });
            if (res.ok) {
                const data = await res.json();
                setTestCasesMarkdown(data.markdown);
            } else {
                throw new Error("Failed to generate test cases");
            }
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSync = async () => {
        if (!selectedItem || !testCasesMarkdown) return;
        setIsSyncing(true);

        try {
            const res = await fetch(`${API_BASE}/api/qa/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parent_id: selectedItem.id,
                    markdown_content: testCasesMarkdown
                })
            });
            
            if (res.ok) {
                setSyncSuccess(true);
            } else {
                throw new Error("Failed to sync to ADO");
            }
        } catch (e) {
            alert("Sync Error: " + e.message);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="view-container">
            <header className="view-header">
                <div className="title-area">
                    <span className="pre-title">Quality Assurance Copilot</span>
                    <h1>Test Case Agent</h1>
                    <p>Select an Azure DevOps work item to automatically generate high-accuracy BDD test cases.</p>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 200px)' }}>
                {/* Left Panel: Item Selection */}
                <div className="glass-card" style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Active Backlog</h3>
                        <button className="icon-button" onClick={fetchWorkItems} disabled={isLoadingItems}>
                            <RefreshCw size={16} className={isLoadingItems ? 'spinner' : ''} />
                        </button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                        {isLoadingItems ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>Loading ADO Items...</div>
                        ) : workItems.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>No work items found.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {workItems.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: selectedItem?.id === item.id ? 'rgba(0, 242, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${selectedItem?.id === item.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'}`,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{item.type} {item.id}</span>
                                            <span style={{ color: item.status === 'New' ? '#ff9800' : '#4caf50' }}>{item.status}</span>
                                        </div>
                                        <div style={{ fontWeight: '500', fontSize: '0.9rem', lineHeight: '1.3' }}>
                                            {item.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Generation & Results */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {selectedItem ? (
                        <>
                            <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Selected Target</div>
                                    <h2 style={{ margin: 0 }}>{selectedItem.type} {selectedItem.id}: {selectedItem.title}</h2>
                                </div>
                                <button 
                                    className="btn-primary" 
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {isGenerating ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
                                    {isGenerating ? "Analyzing..." : "Generate Tests"}
                                </button>
                            </div>

                            <div className="glass-card" style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                                {testCasesMarkdown ? (
                                    <>
                                        <div style={{ flex: 1, paddingBottom: '20px' }}>
                                            <TestCasesViewer rawData={testCasesMarkdown} />
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                            {syncSuccess ? (
                                                <button className="btn-primary" style={{ background: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }} disabled>
                                                    <CheckCircle size={16} /> Synced to ADO
                                                </button>
                                            ) : (
                                                <button 
                                                    className="btn-primary" 
                                                    onClick={handleSync}
                                                    disabled={isSyncing}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    {isSyncing ? <Loader2 size={16} className="spinner" /> : <RefreshCw size={16} />}
                                                    {isSyncing ? "Syncing..." : "Sync to Azure DevOps"}
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : isGenerating ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                                        <Loader2 size={40} className="spinner" style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
                                        <p>Executing Multi-Agent Critic Loop...</p>
                                        <small style={{ color: '#aaa' }}>Drafting cases with Groq, verifying accuracy with Azure OpenAI.</small>
                                    </div>
                                ) : (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                                        <p>Click "Generate Tests" to start.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                            <p>Select a work item from the left panel to begin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestCaseAgentView;
