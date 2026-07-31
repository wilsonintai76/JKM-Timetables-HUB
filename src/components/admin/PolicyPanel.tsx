import React from 'react';
import { UserRole } from '../../types';
import { Shield, Lock, Unlock } from 'lucide-react';
import { PBAC_POLICIES, checkPolicy } from '../../utils/pbac';

interface PolicyPanelProps {
  userRole: UserRole;
}

export const PolicyPanel: React.FC<PolicyPanelProps> = ({ userRole }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3 shadow-sm">
        <h4 className="font-black text-xs text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
          <Shield className="w-4 h-4 text-purple-700" />
          <span>Policy-Based Access Control (PBAC) Evaluation Engine</span>
        </h4>
        <p className="text-xs text-slate-800 leading-relaxed font-medium">
          This application implements a fine-grained, dynamic <strong>PBAC</strong> model to govern system-wide actions. 
          The matrix below evaluates active system policies against your current active role (<strong className="text-purple-900">{userRole}</strong>). 
          Toggle roles in the header to observe dynamic authorization changes immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <h5 className="font-black text-xs text-slate-900 uppercase tracking-wide">Current Role Credentials:</h5>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs font-mono shadow-inner">
            <p><span className="text-slate-500 font-black">User Identity:</span> <span className="text-cyan-800 font-black">Staff-PA-JKM</span></p>
            <p><span className="text-slate-500 font-black">Assigned Role:</span> <span className="text-purple-800 font-black">{userRole}</span></p>
            <p><span className="text-slate-500 font-black">Active Token:</span> <span className="text-emerald-700 font-black">session_token_pbac_3391</span></p>
            <p><span className="text-slate-500 font-black">Security Clearance:</span> <span className="text-amber-700 font-black">Level-{userRole === 'ADMIN' ? 'A (Full)' : userRole === 'ADVISOR' ? 'B (Advisory)' : 'C (ReadOnly)'}</span></p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-sm">
          <h5 className="font-black text-xs text-slate-900 uppercase tracking-wide">System Permissions Evaluation:</h5>
          <div className="space-y-1.5 font-sans">
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-extrabold">Modify Master Database (POL-01)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black border shadow-sm ${checkPolicy(userRole, 'UPLOAD_MASTER_FILE') ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                {checkPolicy(userRole, 'UPLOAD_MASTER_FILE') ? 'GRANTED' : 'DENIED'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-extrabold">Issue Advisory Signature (POL-07)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black border shadow-sm ${checkPolicy(userRole, 'SIGN_ADVISOR_SLIP') ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                {checkPolicy(userRole, 'SIGN_ADVISOR_SLIP') ? 'GRANTED' : 'DENIED'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-extrabold">Broadcast Global Banners (POL-02)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black border shadow-sm ${checkPolicy(userRole, 'ADD_ANNOUNCEMENTS') ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                {checkPolicy(userRole, 'ADD_ANNOUNCEMENTS') ? 'GRANTED' : 'DENIED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-800 font-black uppercase border-b border-slate-300">
            <tr>
              <th className="p-3 w-16 text-center">ID</th>
              <th className="p-3 w-40">Policy Name</th>
              <th className="p-3">Action Key</th>
              <th className="p-3">Governance Rule / Logic Description</th>
              <th className="p-3 w-28 text-center">Active Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {PBAC_POLICIES.map(policy => {
              const allowed = checkPolicy(userRole, policy.action);
              return (
                <tr key={policy.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 text-center font-mono font-black text-slate-400">{policy.id}</td>
                  <td className="p-3 font-black text-slate-900">{policy.name}</td>
                  <td className="p-3 font-mono text-purple-800 text-[10px] font-black bg-slate-50/50">{policy.action}</td>
                  <td className="p-3 text-slate-700 font-medium leading-relaxed">{policy.description}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-wider inline-flex items-center space-x-1 border shadow-sm ${
                      allowed
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}>
                      {allowed ? <Unlock className="w-3.5 h-3.5 mr-1" /> : <Lock className="w-3.5 h-3.5 mr-1" />}
                      {allowed ? 'ALLOWED' : 'DENIED'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
