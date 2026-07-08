import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  PieChart as PieIcon, 
  Award,
  Inbox
} from 'lucide-react';

const Analytics = () => {
  const { toastError } = useToast();

  const [reportsCount, setReportsCount] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reports?limit=100&sortBy=createdAt&order=asc');
        const reports = response.data.reports;
        setReportsCount(reports.length);

        if (reports.length > 0) {
          // 1. Line chart trend dataset
          const trends = reports.map((r, idx) => ({
            name: `Test ${idx + 1}`,
            Overall: r.overallScore,
            Accuracy: r.accuracy,
            Fluency: r.fluency,
            date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          }));
          setTrendData(trends);

          // 2. Radar chart averages
          let sumOverall = 0, sumAccuracy = 0, sumFluency = 0, sumClarity = 0;
          reports.forEach((r) => {
            sumOverall += r.overallScore;
            sumAccuracy += r.accuracy;
            sumFluency += r.fluency;
            sumClarity += r.clarity;
          });
          const count = reports.length;
          setRadarData([
            { subject: 'Overall', A: Math.round(sumOverall / count), fullMark: 100 },
            { subject: 'Accuracy', A: Math.round(sumAccuracy / count), fullMark: 100 },
            { subject: 'Fluency', A: Math.round(sumFluency / count), fullMark: 100 },
            { subject: 'Clarity', A: Math.round(sumClarity / count), fullMark: 100 },
          ]);

          // 3. Tally mistakes for Weak Areas (Bar Chart)
          const issueTally = {};
          const severityTally = { High: 0, Medium: 0, Low: 0 };
          
          reports.forEach((r) => {
            r.mistakes.forEach((m) => {
              // Group common issues roughly
              let issueKey = 'Other';
              const text = m.issue.toLowerCase();
              if (text.includes('vowel')) issueKey = 'Vowel Sound';
              else if (text.includes('syllable') || text.includes('stress')) issueKey = 'Syllable Stress';
              else if (text.includes('consonant') || text.includes('ending')) issueKey = 'Consonants';
              else if (text.includes('pause') || text.includes('flow')) issueKey = 'Fluency/Pauses';
              else if (text.includes('pitch') || text.includes('intonation')) issueKey = 'Intonation';
              else if (text.includes('articulation') || text.includes('voice')) issueKey = 'Articulation';

              issueTally[issueKey] = (issueTally[issueKey] || 0) + 1;
              if (m.severity in severityTally) {
                severityTally[m.severity] += 1;
              }
            });
          });

          // Sort and select top 5 weak areas
          const barDataset = Object.keys(issueTally).map((key) => ({
            name: key,
            Mistakes: issueTally[key],
          })).sort((a, b) => b.Mistakes - a.Mistakes).slice(0, 5);
          setBarData(barDataset);

          // Pie chart dataset of severities
          setPieData([
            { name: 'High', value: severityTally.High },
            { name: 'Medium', value: severityTally.Medium },
            { name: 'Low', value: severityTally.Low },
          ].filter(item => item.value > 0)); // Filter empty items
        }

      } catch (error) {
        console.error('Analytics processing error:', error);
        toastError('Failed to fetch historical analytics details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [toastError]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-44 bg-slate-200 dark:bg-dark-900 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-dark-900 rounded-3xl animate-pulse"></div>
          <div className="h-80 bg-slate-200 dark:bg-dark-900 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Pie chart colors
  const COLORS = ['#ef4444', '#f97316', '#22c55e']; // Red (High), Orange (Med), Green (Low)

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Performance Analytics</h1>
        <p className="text-sm text-slate-500">Visualize aggregate scores, trends, weak phonetic zones, and errors distribution</p>
      </div>

      {reportsCount > 0 ? (
        <div className="space-y-6">
          
          {/* TOP CHART ROW (Trends & Radar) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Progression timeline */}
            <div className="lg:col-span-2 glass-card p-6 rounded-3xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Linguistic Progress</h3>
                  <p className="text-xs text-slate-500">Timeline of Overall, Accuracy, and Fluency scores</p>
                </div>
                <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                  <TrendingUp size={12} />
                  <span>AGGREGATED TRENDS</span>
                </div>
              </div>

              <div className="flex-1 min-h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} stroke="#e2e8f0" axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} stroke="#e2e8f0" axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        background: '#0f172a',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Line type="monotone" dataKey="Overall" stroke="#8b2efb" strokeWidth={3} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Accuracy" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="Fluency" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar chart averages */}
            <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center">
              <div className="text-center mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Skill Balance</h3>
                <p className="text-xs text-slate-500">Average balance across speaking skills</p>
              </div>

              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" r="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="Average" 
                      dataKey="A" 
                      stroke="#8b2efb" 
                      fill="#8b2efb" 
                      fillOpacity={0.25} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* BOTTOM CHART ROW (Weak Areas & Severities) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Weak Areas (Bar Chart) */}
            <div className="lg:col-span-2 glass-card p-6 rounded-3xl flex flex-col">
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Top Weak Areas</h3>
                <p className="text-xs text-slate-500">Phonetic categories containing the highest number of flagged errors</p>
              </div>

              <div className="flex-1 min-h-[220px]">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 10, top: 10, bottom: 5 }}>
                      <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} stroke="#e2e8f0" axisLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} stroke="#e2e8f0" axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          background: '#0f172a',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="Mistakes" fill="#8b2efb" radius={[0, 8, 8, 0]} barSize={16}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#8b2efb' : '#38bdf8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No speech mistake categories mapped yet.
                  </div>
                )}
              </div>
            </div>

            {/* Severity Breakdown (Pie Chart) */}
            <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center">
              <div className="text-center mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Issue Severity</h3>
                <p className="text-xs text-slate-500">Distribution of errors by severity level</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center relative">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => {
                          let color = COLORS[2]; // Low -> Green
                          if (entry.name === 'High') color = COLORS[0]; // High -> Red
                          else if (entry.name === 'Medium') color = COLORS[1]; // Med -> Orange
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No errors distribution to map.
                  </div>
                )}
                {/* Center text in pie chart */}
                {pieData.length > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-400 uppercase font-bold">Total Mistakes</span>
                    <span className="text-xl font-extrabold text-slate-950 dark:text-white">
                      {pieData.reduce((acc, curr) => acc + curr.value, 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Legends */}
              {pieData.length > 0 && (
                <div className="flex gap-4 mt-2 justify-center text-xs font-bold">
                  {pieData.map((item) => (
                    <span key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{
                        backgroundColor: item.name === 'High' ? COLORS[0] : item.name === 'Medium' ? COLORS[1] : COLORS[2]
                      }}></span>
                      <span className="text-slate-500">{item.name} ({item.value})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="glass-card p-16 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-900 flex items-center justify-center text-slate-400">
            <Inbox size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No analytics markers found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              You must run at least one pronunciation assessment to populate charts and analytics dashboards.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Analytics;
