import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ShieldAlert, Activity, DollarSign, Database } from 'lucide-react';

const TelemetryDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Simple admin check

  useEffect(() => {
    // In a real app, verify JWT role here
    setIsAdmin(true); 

    const fetchTelemetry = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/telemetry');
        const result = await response.json();
        
        // Transform data for charts
        const formattedData = result.map(log => ({
          ...log,
          time: new Date(log.timestamp).toLocaleTimeString(),
          costCents: log.total_cost * 100 // Scale for better visibility
        })).reverse(); // Oldest to newest for Line Chart
        
        setData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch telemetry', error);
        setLoading(false);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-gray-400">Only Administrators can view LLMOps Telemetry.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400" />
            LLMOps Telemetry
          </h1>
          <p className="text-gray-400 mt-2">Enterprise Agent Council Observability</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Agent Calls</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{data.length}</h3>
                </div>
                <Database className="w-8 h-8 text-blue-400 opacity-80" />
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Avg Latency</p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    {data.length > 0 ? Math.round(data.reduce((a, b) => a + b.latency_ms, 0) / data.length) : 0} ms
                  </h3>
                </div>
                <Activity className="w-8 h-8 text-green-400 opacity-80" />
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Est. Cost</p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    ${data.reduce((a, b) => a + b.total_cost, 0).toFixed(4)}
                  </h3>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400 opacity-80" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg h-96">
              <h3 className="text-lg font-semibold mb-6">Latency over Time (ms)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="latency_ms" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Latency" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg h-96">
              <h3 className="text-lg font-semibold mb-6">Token Cost per Agent (Cents)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="agent_name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="costCents" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Cost (Cents)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Grid */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
              <h3 className="text-lg font-semibold text-white">Recent Agent Invocations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-900/50 text-xs uppercase font-medium text-gray-300">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Agent</th>
                    <th className="px-6 py-3">Provider</th>
                    <th className="px-6 py-3">Model</th>
                    <th className="px-6 py-3">Latency (ms)</th>
                    <th className="px-6 py-3">Tokens (P/C)</th>
                    <th className="px-6 py-3">Cost</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {data.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{log.time}</td>
                      <td className="px-6 py-4 font-medium text-gray-200">{log.agent_name}</td>
                      <td className="px-6 py-4 capitalize">{log.provider}</td>
                      <td className="px-6 py-4">{log.model_name}</td>
                      <td className="px-6 py-4">{Math.round(log.latency_ms)}</td>
                      <td className="px-6 py-4 text-gray-500">{log.prompt_tokens} / {log.completion_tokens}</td>
                      <td className="px-6 py-4">${log.total_cost.toFixed(4)}</td>
                      <td className="px-6 py-4">
                        {log.success ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400">
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400" title={log.error_message}>
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelemetryDashboard;
