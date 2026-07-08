import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { 
  ArrowLeft, 
  FileText, 
  Trash2, 
  Share2, 
  Download, 
  Calendar,
  AlertTriangle,
  Lightbulb,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toastSuccess, toastError, toastInfo } = useToast();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/reports/${id}`);
        setReport(response.data);
        
        // Trigger celebration confetti for high overall scores (>= 85)
        if (response.data.overallScore >= 85) {
          setTimeout(() => {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 }
            });
          }, 300);
        }
      } catch (error) {
        console.error('Fetch report details failure:', error);
        toastError(error.response?.data?.message || 'Report not found or access denied.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, navigate, toastError]);

  const handleDownloadPdf = () => {
    // Direct link to backend PDF endpoint with JWT auth token appended
    const token = localStorage.getItem('aura-token');
    if (!token) return;
    
    toastInfo('Compiling PDF report. Your download will start shortly...');
    
    // We fetch the PDF file via Axios and create an download blob to keep the Authorization header secure
    api({
      url: `/download/pdf?id=${id}`,
      method: 'GET',
      responseType: 'blob', // Important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AuraReport-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastSuccess('PDF report downloaded successfully.');
    }).catch((err) => {
      console.error('PDF fetch failed:', err);
      toastError('Failed to download PDF report.');
    });
  };

  const handleShareReport = () => {
    // Copy URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    toastSuccess('Report URL copied to clipboard! You can share this link.');
  };

  const handleDeleteReport = async () => {
    try {
      await api.delete(`/reports/${id}`);
      toastSuccess('Report deleted successfully.');
      navigate('/history');
    } catch (error) {
      console.error('Report deletion failure:', error);
      toastError('Failed to delete report.');
    }
  };

  // Helper to split transcript text into individual words, strip punctuation to check mistakes,
  // but keep original words + punctuation intact.
  const renderHighlightedTranscript = () => {
    if (!report) return null;

    const words = report.transcript.split(/\s+/);
    return (
      <div className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-sans tracking-wide p-6 bg-slate-50 dark:bg-dark-900/30 rounded-2xl border border-slate-100 dark:border-dark-800/40 relative">
        {words.map((word, index) => {
          // Strip punctuation to match key
          const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase();
          const mistake = report.mistakes.find(m => m.word.toLowerCase() === cleanWord);

          if (mistake) {
            let severityColor = 'border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300';
            let pillColor = 'bg-amber-500';
            if (mistake.severity === 'High') {
              severityColor = 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300';
              pillColor = 'bg-rose-500';
            } else if (mistake.severity === 'Low') {
              severityColor = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300';
              pillColor = 'bg-emerald-500';
            }

            return (
              <span 
                key={index}
                className={`relative group border-b-2 font-semibold px-0.5 mx-0.5 rounded cursor-pointer inline-block transition-all ${severityColor}`}
              >
                {word}
                {/* Visual Tooltip Overlay */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-slate-900 dark:bg-slate-850 text-white rounded-2xl text-xs font-semibold leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 text-left border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-extrabold capitalize text-primary-400 text-sm">{mistake.word}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white uppercase ${pillColor}`}>
                      {mistake.severity} Severity
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-slate-300"><strong className="text-white">Issue:</strong> {mistake.issue}</p>
                    <p className="text-slate-300"><strong className="text-white">Correction:</strong> {mistake.suggestion}</p>
                  </div>
                  {/* Arrow element */}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-850"></span>
                </span>
              </span>
            );
          }

          return <span key={index} className="mx-0.5 inline-block">{word}</span>;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-24 bg-slate-200 dark:bg-dark-900 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-72 bg-slate-200 dark:bg-dark-900 rounded-3xl animate-pulse md:col-span-1"></div>
          <div className="h-72 bg-slate-200 dark:bg-dark-900 rounded-3xl animate-pulse md:col-span-2"></div>
        </div>
        <div className="h-48 bg-slate-200 dark:bg-dark-900 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  // Format Recharts Radar dataset
  const radarData = [
    { subject: 'Overall', A: report.overallScore, fullMark: 100 },
    { subject: 'Accuracy', A: report.accuracy, fullMark: 100 },
    { subject: 'Fluency', A: report.fluency, fullMark: 100 },
    { subject: 'Clarity', A: report.clarity, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to History</span>
        </button>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleShareReport}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-4 shadow-sm"
          >
            <Share2 size={14} />
            <span>Share Link</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 shadow-sm"
          >
            <Download size={14} />
            <span>Download PDF Report</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 font-semibold text-xs py-2 px-4 border border-rose-200/50 dark:border-rose-900/20 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
          >
            <Trash2 size={14} />
            <span>Delete Report</span>
          </button>
        </div>
      </div>

      {/* Main Score breakdown row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CIRCULAR GAUGE COMPONENT */}
        <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Rating</h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Circular path */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="68"
                className="stroke-slate-200 dark:stroke-dark-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                className="stroke-primary-600 dark:stroke-primary-500"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 68}
                strokeDashoffset={2 * Math.PI * 68 * (1 - report.overallScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{report.overallScore}</span>
              <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500 flex items-center gap-3 bg-slate-100 dark:bg-dark-900 px-3 py-1.5 rounded-xl">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(report.createdAt).toLocaleDateString('en-IN')}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {report.audioDuration}s length
            </span>
          </div>
        </div>

        {/* CORE METRIC TRACKS & RADAR */}
        <div className="glass-card p-6 rounded-3xl md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          
          {/* Progress sliders */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Metrics Breakdown</h3>
            
            {/* Accuracy */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Phonetic Accuracy</span>
                <span className="text-primary-600 dark:text-primary-400 font-bold">{report.accuracy}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{ width: `${report.accuracy}%` }}></div>
              </div>
            </div>

            {/* Fluency */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Fluency & Rhythm</span>
                <span className="text-accent-500 font-bold">{report.fluency}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full" style={{ width: `${report.fluency}%` }}></div>
              </div>
            </div>

            {/* Clarity */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Grammar & Clarity</span>
                <span className="text-emerald-500 font-bold">{report.clarity}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: `${report.clarity}%` }}></div>
              </div>
            </div>
          </div>

          {/* Recharts Radar chart visualizer */}
          <div className="h-48 sm:h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar 
                  name="Assessment" 
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

      {/* Interactive Speech Transcript */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Speech Transcript</h3>
          <p className="text-xs text-slate-500">Hover over highlighted words to see phonetics corrections and stress recommendations</p>
        </div>
        {renderHighlightedTranscript()}
      </div>

      {/* Identified Mistakes Table & Tips list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mistakes Table Card */}
        <div className="glass-card p-6 rounded-3xl flex flex-col text-left">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-800/40 pb-3 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Flagged Sound Pitfalls</h3>
          </div>

          <div className="flex-1 overflow-x-auto">
            {report.mistakes.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-100 dark:border-dark-850 pb-2">
                    <th className="pb-2 text-left font-semibold">Word</th>
                    <th className="pb-2 text-left font-semibold">Phonetic Issue</th>
                    <th className="pb-2 text-left font-semibold">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-850">
                  {report.mistakes.map((mistake, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-dark-900/30">
                      <td className="py-2.5 font-bold capitalize text-slate-800 dark:text-white">{mistake.word}</td>
                      <td className="py-2.5 text-slate-500 pr-2">{mistake.issue}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          mistake.severity === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                          mistake.severity === 'Medium' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 
                          'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {mistake.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-450 py-12 text-sm font-semibold">
                No pronunciation issues detected. Your articulation is excellent!
              </div>
            )}
          </div>
        </div>

        {/* Actionable coaching tips card */}
        <div className="glass-card p-6 rounded-3xl flex flex-col text-left">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-800/40 pb-3 mb-4">
            <Lightbulb size={18} className="text-primary-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Coaching Suggestions</h3>
          </div>

          <div className="flex-1 space-y-4">
            {report.tips.length > 0 ? (
              <ul className="space-y-3">
                {report.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-650 dark:text-slate-350">
                    <span className="h-5 w-5 shrink-0 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-650 dark:text-primary-400 flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-550 py-6">No specific recommendations. Continue practicing consistently!</p>
            )}
          </div>
        </div>

      </div>

      {/* CONFIRM DELETE DIALOG OVERLAY */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card max-w-sm w-full p-6 rounded-2xl border border-rose-500/20 shadow-xl space-y-5 animate-slide-up">
            <div className="flex items-center gap-2 text-rose-500">
              <Trash2 size={22} />
              <h3 className="font-bold text-lg">Delete Assessment Report</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed text-left">
              Are you sure you want to permanently delete this report? This action is irreversible and will remove all scores, highlighted transcripts, and recommendations from your records.
            </p>
            <div className="flex justify-end gap-3.5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReport}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-1.5 px-4 rounded-xl shadow-md transition-all active:scale-95"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportDetail;
