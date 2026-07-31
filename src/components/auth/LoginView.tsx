import React, { useState } from 'react';
import { LogIn, UserPlus, GraduationCap, Calendar, ShieldCheck, Zap, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginViewProps {
  onLogin: (email: string, pass: string) => void;
  onSignUp: (email: string, pass: string, name: string, role: 'STUDENT' | 'ADVISOR', section?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSignUp }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('DKM3A');
  const [role, setRole] = useState<'STUDENT' | 'ADVISOR'>('STUDENT');

  const SECTIONS = [
    'DKM1A', 'DKM1B', 'DKM1C', 'DKM2A', 'DKM2B', 'DKM3A', 'DKM4A',
    'DTP1A', 'DTP2A', 'DTP3A',
    'DAD1A', 'DAD2A', 'DAD3A',
    'DPU1A', 'DPU2A', 'DPU3A',
    'DIT1A', 'DIT1B', 'DIT3A', 'DIT4A',
    'DAT1A', 'DAT1B', 'DAT3A',
    'DEP1A', 'DEP1B', 'DEP3A'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(email, password);
    } else {
      onSignUp(email, password, name, role, section);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* LEFT SIDE: HERO SECTION */}
      <div className="lg:w-1/2 bg-cyan-900 relative overflow-hidden flex flex-col justify-center p-8 lg:p-16 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-800 rounded-full -mr-32 -mt-32 opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-700 rounded-full -ml-48 -mb-48 opacity-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center space-x-2 bg-cyan-800/50 px-3 py-1 rounded-full border border-cyan-700/50 mb-6">
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">Smart Academic Scheduling</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
            JKM <span className="text-cyan-400">Edge</span> <br/>
            Academic Portal.
          </h1>
          
          <p className="text-lg lg:text-xl text-cyan-100/70 mb-12 max-w-lg leading-relaxed font-medium">
            Next-gen scheduling for Politeknik Malaysia. Deploying high-performance matrix resolution for every student, powered by Hono and Edge Intelligence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-cyan-800 flex items-center justify-center shrink-0 group-hover:bg-cyan-700 transition-colors">
                <Calendar className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider mb-1">Clash Resolver</h3>
                <p className="text-xs text-cyan-100/60 leading-normal">Smart matrix algorithms to fix overlapping course slots in seconds.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-cyan-800 flex items-center justify-center shrink-0 group-hover:bg-cyan-700 transition-colors">
                <ShieldCheck className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider mb-1">Official Compliance</h3>
                <p className="text-xs text-cyan-100/60 leading-normal">Generate Borang PK01 and weekly slips verified by department standards.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-cyan-400" />
            <span className="font-black text-xs uppercase tracking-widest">Mechanical Engineering Dept.</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: AUTH SECTION */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-8 lg:p-10 rounded-3xl shadow-2xl border border-slate-200"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {isLogin ? 'Sign in to Portal' : 'Create Account'}
            </h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">
              {isLogin ? 'Enter your credentials' : 'Join the academic network'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('STUDENT')}
                      className={`py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                        role === 'STUDENT' 
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm' 
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('ADVISOR')}
                      className={`py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                        role === 'ADVISOR' 
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm' 
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      Advisor
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {(role === 'STUDENT' || role === 'ADVISOR') && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1"
                  >
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      {role === 'STUDENT' ? 'Base Class Section' : 'Assigned Advisor Section'}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        required
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold appearance-none"
                      >
                        {SECTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold"
                  placeholder="name@polytechnic.edu.my"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:text-cyan-700">Forgot?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-4 bg-cyan-700 hover:bg-cyan-600 text-white font-black rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              <span>{isLogin ? 'Sign In to Portal' : 'Create Account'}</span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="group inline-flex items-center space-x-2 text-xs font-black text-slate-500 hover:text-cyan-700 transition-colors uppercase tracking-widest"
            >
              <span>{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
