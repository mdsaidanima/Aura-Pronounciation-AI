import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import { 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  ArrowUpDown, 
  Volume2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Inbox
} from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const { toastSuccess, toastError, toastInfo } = useToast();

  // Search & Pagination States
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Delete control states
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports', {
        params: {
          page,
          limit: 8,
          search: searchTerm,
          sortBy,
          order,
        },
      });
      setReports(response.data.reports);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Fetch reports error:', error);
      toastError('Failed to load history logs.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, sortBy, order, toastError]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Debounced search trigger (resets page)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleSortToggle = (field) => {
    if (sortBy === field) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const handleDownloadPdf = (reportId) => {
    toastInfo('Compiling PDF report...');
    api({
      url: `/download/pdf?id=${reportId}`,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AuraReport-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastSuccess('PDF downloaded.');
    }).catch((err) => {
      console.error('PDF download error:', err);
      toastError('Download failed.');
    });
  };

  const handleDeleteReport = async () => {
    if (!deleteTargetId) return;

    try {
      await api.delete(`/reports/${deleteTargetId}`);
      toastSuccess('Report deleted successfully.');
      setDeleteTargetId(null);
      
      // If we delete the last item on the current page, go back
      if (reports.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchReports();
      }
    } catch (error) {
      console.error('Delete report failure:', error);
      toastError('Failed to delete report.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">History Logs</h1>
        <p className="text-sm text-slate-500 font-sans">Browse, filter, and review your past audio pronunciation assessments</p>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search transcripts..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900/60 text-sm text-slate-800 dark:text-white form-input-focus shadow-sm"
          />
        </div>

        {/* Sort fields quick toggle */}
        <div className="flex gap-2.5 shrink-0 self-stretch sm:self-auto justify-end">
          <button
            onClick={() => handleSortToggle('createdAt')}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${
              sortBy === 'createdAt'
                ? 'bg-primary-50 border-primary-250 text-primary-600 dark:bg-primary-950/20 dark:border-primary-800 dark:text-primary-400'
                : 'bg-white dark:bg-dark-900/60 border-slate-200 dark:border-dark-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <span>Date</span>
            <ArrowUpDown size={12} />
          </button>
          <button
            onClick={() => handleSortToggle('overallScore')}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${
              sortBy === 'overallScore'
                ? 'bg-primary-50 border-primary-250 text-primary-600 dark:bg-primary-950/20 dark:border-primary-800 dark:text-primary-400'
                : 'bg-white dark:bg-dark-900/60 border-slate-200 dark:border-dark-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <span>Score</span>
            <ArrowUpDown size={12} />
          </button>
        </div>
      </div>

      {loading ? (
        /* Loader skeleton */
        <div className="glass-card rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-dark-850">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3 w-2/3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-dark-800"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-200 dark:bg-dark-800 rounded w-4/5"></div>
                  <div className="h-2.5 bg-slate-200 dark:bg-dark-800 rounded w-1/3"></div>
                </div>
              </div>
              <div className="w-10 h-6 bg-slate-200 dark:bg-dark-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : reports.length > 0 ? (
        /* Reports Table (Desktop) & Card List (Mobile) */
        <div className="space-y-4">
          <div className="hidden md:block glass-card rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-dark-900/50 text-slate-450 border-b border-slate-200/50 dark:border-dark-800/40 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Transcript Preview</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Assessment Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-dark-850">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-900/10 transition-colors">
                    {/* Transcript */}
                    <td className="px-6 py-4 max-w-sm truncate font-medium text-slate-800 dark:text-white">
                      "{report.transcript}"
                    </td>
                    
                    {/* Overall Score */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-dark-800 text-slate-900 dark:text-white border border-slate-200/30">
                        {report.overallScore}
                      </span>
                    </td>
                    
                    {/* Audio Duration */}
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {report.audioDuration}s
                    </td>
                    
                    {/* Created Date */}
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(report.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    
                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/reports/${report._id}`)}
                          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition-all"
                          title="View analysis detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(report._id)}
                          className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-xl transition-all"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(report._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                          title="Delete assessment record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards for Mobile viewports */}
          <div className="grid md:hidden grid-cols-1 gap-4">
            {reports.map((report) => (
              <div 
                key={report._id} 
                className="glass-card p-5 rounded-2xl flex flex-col gap-4 text-left border border-slate-200/40"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                      <Volume2 size={14} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {new Date(report.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-950 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-dark-900 rounded-lg">
                    {report.overallScore}
                  </span>
                </div>

                <p className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-350 italic">
                  "{report.transcript}"
                </p>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-dark-850">
                  <span className="text-[10px] text-slate-500 font-medium">Duration: {report.audioDuration}s</span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/reports/${report._id}`)}
                      className="p-2 bg-slate-100 dark:bg-dark-800 rounded-lg text-slate-600 dark:text-slate-300"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(report._id)}
                      className="p-2 bg-primary-50 dark:bg-primary-950/20 rounded-lg text-primary-500"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(report._id)}
                      className="p-2 bg-rose-50 dark:bg-rose-950/20 rounded-lg text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500">
                Page {page} of {pagination.pages} ({pagination.total} reports)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 rounded-xl text-slate-600 hover:bg-slate-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 rounded-xl text-slate-600 hover:bg-slate-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Empty State */
        <div className="glass-card p-16 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-900 flex items-center justify-center text-slate-400">
            <Inbox size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No history records found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {searchTerm 
                ? `No reports match the transcript keyword search: "${searchTerm}".` 
                : 'You have not performed any voice evaluations yet.'}
            </p>
          </div>
          {!searchTerm && (
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Assess Pronunciation</span>
            </button>
          )}
        </div>
      )}

      {/* CONFIRM DELETE MODAL DIALOG */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-sm w-full p-6 rounded-2xl border border-rose-500/20 shadow-xl space-y-5 animate-slide-up">
            <div className="flex items-center gap-2 text-rose-500">
              <Trash2 size={22} />
              <h3 className="font-bold text-lg">Delete Assessment Report</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete this report? This action is irreversible and will remove all scores and highlighted transcript records.
            </p>
            <div className="flex justify-end gap-3.5">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReport}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-1.5 px-4 rounded-xl shadow-md transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default History;
