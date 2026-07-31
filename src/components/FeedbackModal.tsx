import React, { useState } from 'react';
import { UserFeedback } from '../types';
import { MessageSquarePlus, Star, Send, X, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onFeedbackSubmitted?: () => void;
  availableCourses?: string[];
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen = true,
  onClose,
  onFeedbackSubmitted,
  availableCourses = []
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<UserFeedback['category']>('UI/UX Suggestion');
  const [courseCode, setCourseCode] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newFeedback: UserFeedback = {
      id: `fb_${Date.now()}`,
      name: name.trim() || 'Anonymous Student',
      email: email.trim(),
      category,
      courseCode: courseCode.trim().toUpperCase(),
      rating,
      message: message.trim(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'New'
    };

    const existing: UserFeedback[] = JSON.parse(localStorage.getItem('jkm_user_feedback') || '[]');
    localStorage.setItem('jkm_user_feedback', JSON.stringify([newFeedback, ...existing]));

    setSubmitted(true);
    if (onFeedbackSubmitted) onFeedbackSubmitted();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-cyan-100 rounded-lg border border-cyan-300 shadow-sm">
              <MessageSquarePlus className="w-5 h-5 text-cyan-700" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Timetable Feedback & Improvement Hub</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-900 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-black text-slate-900 text-base">Thank You for Your Feedback!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-medium">
              Your report has been logged successfully for the academic administrator and development team review.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs transition shadow-md active:scale-95"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-700 block mb-0.5 text-[11px] font-black uppercase tracking-tight">Your Name / Matrix</label>
                <input
                  type="text"
                  placeholder="e.g. Adam (05DKM22F1042)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
                />
              </div>
              <div>
                <label className="text-slate-700 block mb-0.5 text-[11px] font-black uppercase tracking-tight">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="student@politeknik.edu.my"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-700 block mb-0.5 text-[11px] font-black uppercase tracking-tight">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as UserFeedback['category'])}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 text-xs font-black cursor-pointer focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                >
                  <option value="Data Inaccuracy">Data Inaccuracy (Venue/Time)</option>
                  <option value="Resolver Bug">Resolver / Clash Engine Bug</option>
                  <option value="UI/UX Suggestion">UI / Layout Improvement</option>
                  <option value="Feature Request">New Feature Request</option>
                  <option value="General Comment">General Comment</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-0.5 text-[11px] font-black uppercase tracking-tight">Course Code (If relevant)</label>
                <input
                  type="text"
                  placeholder="e.g. DJJ10013"
                  value={courseCode}
                  onChange={e => setCourseCode(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 font-mono text-xs uppercase font-black focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 block mb-1 text-[11px] font-black uppercase tracking-tight">Overall Rating / Satisfaction</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition"
                  >
                    <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-500' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-700 block mb-0.5 text-[11px] font-black uppercase tracking-tight">Feedback Message & Details</label>
              <textarea
                required
                rows={3}
                placeholder="Describe any timetable mismatch, venue change, or suggestion..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs border border-slate-200 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs transition shadow-md shadow-cyan-500/20 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
