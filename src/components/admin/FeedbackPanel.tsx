import React from 'react';
import { UserFeedback } from '../../types';
import { Star, CheckCircle, Trash2 } from 'lucide-react';

interface FeedbackPanelProps {
  userFeedback: UserFeedback[];
  setUserFeedback: React.Dispatch<React.SetStateAction<UserFeedback[]>>;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  userFeedback,
  setUserFeedback
}) => {
  const toggleFeedbackStatus = (id: string) => {
    const updated: UserFeedback[] = userFeedback.map(f =>
      f.id === id ? { ...f, status: (f.status === 'Resolved' ? 'New' : 'Resolved') as UserFeedback['status'] } : f
    );
    setUserFeedback(updated);
    localStorage.setItem('jkm_user_feedback', JSON.stringify(updated));
  };

  const deleteFeedback = (id: string) => {
    const updated = userFeedback.filter(f => f.id !== id);
    setUserFeedback(updated);
    localStorage.setItem('jkm_user_feedback', JSON.stringify(updated));
  };

  return (
    <div className="space-y-3">
      <h4 className="font-black text-xs text-slate-900 uppercase tracking-wide">Logged Student Feedback & Data Reports</h4>
      {userFeedback.length === 0 ? (
        <p className="text-slate-500 text-xs text-center py-8 font-medium">No feedback submissions logged yet.</p>
      ) : (
        userFeedback.map(fb => (
          <div key={fb.id} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-sm hover:border-slate-400 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-black text-cyan-800">{fb.name}</span>
                <span className="text-slate-400 font-bold tracking-tight">• {fb.date}</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-black shadow-sm">
                  {fb.category}
                </span>
                {fb.courseCode && (
                  <span className="font-mono text-amber-700 font-black text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">{fb.courseCode}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border shadow-sm ${
                  fb.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {fb.status}
                </span>
                <button
                  onClick={() => toggleFeedbackStatus(fb.id)}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition"
                  title="Toggle Resolved status"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteFeedback(fb.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Delete Feedback"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">{fb.message}</p>

            <div className="flex items-center space-x-1 text-amber-500 text-[10px] font-black">
              <span>Rating:</span>
              {[...Array(fb.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-500" />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
