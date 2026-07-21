import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckCircle, Code } from 'lucide-react';

const TestCasesViewer = ({ rawData }) => {
  const [viewMode, setViewMode] = useState('manual'); // 'manual' or 'code'

  let parsedData = { test_cases: [], playwright_script: '' };
  let errorMsg = null;
  
  if (rawData) {
    if (typeof rawData === 'object' && rawData !== null) {
      if (Array.isArray(rawData)) {
        parsedData = { test_cases: rawData, playwright_script: '' };
      } else {
        parsedData = rawData;
      }
    } else if (typeof rawData === 'string') {
      try {
        let cleanStr = rawData.trim();
        // Remove markdown formatting like ```json and ``` at the start/end
        if (cleanStr.startsWith('```')) {
          cleanStr = cleanStr.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
        }
        parsedData = JSON.parse(cleanStr);
      } catch (e) {
        errorMsg = "Unable to parse structured test cases. Displaying raw output instead.";
      }
    }
  }

  if (errorMsg || !parsedData.test_cases?.length) {
    return (
      <div className="markdown-body">
        {errorMsg && <div style={{ color: 'var(--warning)', marginBottom: '10px' }}>{errorMsg}</div>}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{rawData || "*No Test Cases generated for this session.*"}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="test-cases-viewer">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div style={{ display: 'flex', background: 'var(--glass-border)', padding: '4px', borderRadius: '8px' }}>
          <button 
            className={`btn-ghost ${viewMode === 'manual' ? 'active' : ''}`}
            onClick={() => setViewMode('manual')}
            style={{ padding: '4px 12px', background: viewMode === 'manual' ? 'var(--secondary-bg)' : 'transparent', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
          >
            <CheckCircle size={16} style={{marginRight: '6px'}}/> Manual Cases
          </button>
          <button 
            className={`btn-ghost ${viewMode === 'code' ? 'active' : ''}`}
            onClick={() => setViewMode('code')}
            style={{ padding: '4px 12px', background: viewMode === 'code' ? 'var(--secondary-bg)' : 'transparent', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
          >
            <Code size={16} style={{marginRight: '6px'}}/> Playwright Spec
          </button>
        </div>
      </div>

      {viewMode === 'manual' ? (
        <div className="manual-cases-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {parsedData.test_cases.map((tc, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 8px 0' }}>
                    <h4 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{tc.test_case_id}</h4>
                    {tc.user_story_id && (
                      <span style={{ 
                        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', 
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' 
                      }}>
                        🔗 {tc.user_story_id}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontWeight: '500' }}>{tc.description}</p>
                </div>
                <span style={{ 
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                  background: tc.test_type.toLowerCase().includes('positive') ? 'rgba(25,128,56,0.1)' : 
                              tc.test_type.toLowerCase().includes('negative') ? 'rgba(218,30,40,0.1)' : 'rgba(241,194,27,0.1)',
                  color: tc.test_type.toLowerCase().includes('positive') ? 'var(--success)' : 
                         tc.test_type.toLowerCase().includes('negative') ? 'var(--error)' : 'var(--warning)'
                }}>
                  {tc.test_type}
                </span>
              </div>
              
              {tc.preconditions?.length > 0 && (
                <div style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <strong>Preconditions:</strong> {tc.preconditions.join(' | ')}
                </div>
              )}
              
              <div style={{ background: 'var(--primary-bg)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem' }}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>Steps:</strong>
                <ol style={{ margin: '0 0 12px 20px', padding: 0 }}>
                  {tc.steps.map((step, sIdx) => <li key={sIdx} style={{marginBottom: '4px'}}>{step}</li>)}
                </ol>
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                  <strong>Expected Result:</strong> {tc.expected_result}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="playwright-code-view">
          {parsedData.playwright_script ? (
             <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '16px', overflowX: 'auto' }}>
               <pre style={{ margin: 0, color: '#d4d4d4', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem' }}>
                 <code>{parsedData.playwright_script}</code>
               </pre>
             </div>
          ) : (
             <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
               No Playwright script generated for this set.
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCasesViewer;
