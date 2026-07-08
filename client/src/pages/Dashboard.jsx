import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Mic, 
  TrendingUp, 
  Award, 
  Activity, 
  ArrowRight, 
  Volume2, 
  Calendar,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { toastError } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch user profile stats
        const profileRes = await api.get('/profile');
        setStats(profileRes.data.stats);

        // 2. Fetch recent reports
        const reportsRes = await api.get('/reports?limit=7&sortBy=createdAt&order=asc');
        const reportsList = reportsRes.data.reports;
        
        setRecentReports([...reportsList].reverse().slice(0, 5)); // Show recent 5

        // 3. Format chart data (Oldest to Newest)
        const formattedChart = reportsList.map((r, idx) => ({
          name: `Test ${idx + 1}`,
          score: r.overallScore,
          date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        }));
        setChartData(formattedChart);

      } catch (error) {
        console.error('Dashboard loading error:', error.message);
        toastError('Failed to load dashboard metrics. Try refreshing.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toastError]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Welcome banner */}
        <div className="h-44 w-full bg-slate-200 dark:bg-dark-900 rounded-3xl animate-pulse"></div>
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-dark-900 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        {/* Skeleton Chart & Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-dark-900 rounded-3xl animate-pulse"></div>
          <div className="h-80 bg-slate-200 dark:bg-dark-900 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. WELCOME HERO CARD */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-900 to-slate-900 text-white overflow-hidden shadow-lg border border-primary-800/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-800/40 border border-primary-500/20 text-primary-300 text-xs font-bold">
              <Sparkles size={12} />
              <span>PRO ASSESSMENT ACTIVE</span>
            </div>
            <h1 className="font-sans font-extrabold text-2xl sm:text-3xl leading-tight">
              Hello, {user?.name || 'Practitioner'}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Ready to fine-tune your English pronunciation? Perform a quick 30-45s audio test to map vowel stress, sound accuracies, and grammar clarity scores.
            </p>
            <div className="pt-2">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm py-2.5 px-5 rounded-xl transition-all hover:scale-[1.02] shadow-md hover:shadow-lg active:scale-95"
              >
                <span>Assess Pronunciation</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Quick Stats callout */}
          <div className="md:col-span-4 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Your Average Score</span>
            <span className="text-5xl font-extrabold text-white mt-1 mb-2">{stats?.averageScore || 0}%</span>
            <div className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {stats?.totalReports > 0 ? `${stats.totalReports} Assessments Completed` : 'No Assessments Yet'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS SUMMARY WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Assessments */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Mic size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Assessments</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats?.totalReports || 0}</h3>
          </div>
        </div>

        {/* Avg Accuracy */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-950/40 text-accent-600 dark:text-accent-400 flex items-center justify-center">
            <Award size={22} />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Avg Accuracy</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.averageAccuracy || 0}%</h3>
            </div>
          </div>
        </div>

        {/* Avg Fluency */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Avg Fluency</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.averageFluency || 0}%</h3>
            </div>
          </div>
        </div>

        {/* Avg Clarity */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Activity size={22} />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Avg Clarity</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.averageClarity || 0}%</h3>
            </div>
          </div>
        </div>

      </div>

      {/* 3. CHART & RECENT REPORTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart (LineChart) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl flex flex-col text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Score Progression</h3>
              <p className="text-xs text-slate-500">History of overall scores across assessments</p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-800 text-xs font-bold text-slate-500">
              Trend View
            </div>
          </div>

          <div className="flex-1 min-h-[220px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} stroke="#e2e8f0" axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} stroke="#e2e8f0" axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      background: theme === 'dark' ? '#0f172a' : '#ffffff',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="url(#colorScore)" 
                    strokeWidth={3} 
                    dot={{ r: 4, stroke: '#8b2efb', strokeWidth: 2, fill: '#fff' }}
                  />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b2efb" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <TrendingUp size={36} className="opacity-40" />
                <span className="text-xs">No historical score markers to plot yet.</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reports List */}
        <div className="glass-card p-6 rounded-3xl flex flex-col text-left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Recent Tests</h3>
            <Link to="/history" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[250px] pr-1 space-y-3.5">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => navigate(`/reports/${report._id}`)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-dark-900/40 dark:hover:bg-dark-900/80 border border-slate-100 dark:border-dark-800/40 cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                      <Volume2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        "{report.transcript}"
                      </p>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        {new Date(report.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <span className="ml-3 text-sm font-extrabold text-slate-950 dark:text-white shrink-0 bg-slate-200/50 dark:bg-dark-850 px-2 py-0.5 rounded-lg border border-slate-200/30">
                    {report.overallScore}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-8">
                <Mic size={36} className="opacity-40 animate-pulse" />
                <span className="text-xs">No recording files processed yet.</span>
                <Link to="/upload" className="text-xs font-bold text-primary-500 hover:underline">
                  Record Speech
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
