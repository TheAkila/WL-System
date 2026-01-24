import { useState } from 'react';
import { Download, FileText, Table, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ExportMenu({ sessionId, sessionName, competitionId }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (type) => {
    setLoading(true);
    try {
      let endpoint = '';
      let filename = '';

      switch (type) {
        case 'protocol':
          endpoint = `/exports/sessions/${sessionId}/protocol.pdf`;
          filename = `protocol_${sessionName?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
          break;
        case 'leaderboard':
          endpoint = `/exports/sessions/${sessionId}/leaderboard.csv`;
          filename = `leaderboard_${sessionName?.replace(/\s+/g, '_')}_${Date.now()}.csv`;
          break;
        case 'startlist':
          endpoint = `/exports/sessions/${sessionId}/startlist.csv`;
          filename = `startlist_${sessionName?.replace(/\s+/g, '_')}_${Date.now()}.csv`;
          break;
        case 'competition':
          endpoint = `/exports/competitions/${competitionId}/results.pdf`;
          filename = `competition_results_${Date.now()}.pdf`;
          break;
        default:
          throw new Error('Unknown export type');
      }

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Export downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Download className="text-blue-600" size={24} />
        <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
          Export Reports
        </h3>
      </div>

      <div className="space-y-3">
        {sessionId && (
          <>
            <button
              onClick={() => handleExport('protocol')}
              disabled={loading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <FileText size={20} />
              )}
              <span>Protocol Sheet (PDF)</span>
            </button>

            <button
              onClick={() => handleExport('leaderboard')}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Table size={20} />
              )}
              <span>Leaderboard (CSV)</span>
            </button>

            <button
              onClick={() => handleExport('startlist')}
              disabled={loading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Table size={20} />
              )}
              <span>Start List (CSV)</span>
            </button>
          </>
        )}

        {competitionId && !sessionId && (
          <button
            onClick={() => handleExport('competition')}
            disabled={loading}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <FileText size={20} />
            )}
            <span>Competition Results (PDF)</span>
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg">
        <p className="text-xs text-slate-600 dark:text-zinc-400">
          <strong>Protocol Sheet:</strong> Official results document with rankings and medals.<br />
          <strong>Leaderboard:</strong> Detailed athlete results in spreadsheet format.<br />
          <strong>Start List:</strong> List of registered athletes with details.
        </p>
      </div>
    </div>
  );
}
