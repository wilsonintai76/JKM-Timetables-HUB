import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Code2, Check, Copy, X } from 'lucide-react';

interface FormatGuideModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const FormatGuideModal: React.FC<FormatGuideModalProps> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;
  const [activeTab, setActiveTab] = useState<'xlsx' | 'csv' | 'json'>('xlsx');
  const [copied, setCopied] = useState(false);

  const sampleJsonSnippet = `[
  {
    "section": "DKM1A",
    "courseCode": "DJJ10013",
    "courseName": "Engineering Drawing",
    "creditHours": 3,
    "day": "ISNIN",
    "startTime": "08:00",
    "endTime": "10:00",
    "venue": "Bengkel Lukisan 1",
    "lecturer": "En. Azman"
  },
  {
    "section": "DKM3A",
    "courseCode": "DJJ30083",
    "courseName": "Fluid Mechanics",
    "creditHours": 3,
    "day": "ISNIN",
    "startTime": "08:00",
    "endTime": "10:00",
    "venue": "Makmal Bendalir",
    "lecturer": "Ir. Dr. Tan"
  }
]`;

  const copyJson = () => {
    navigator.clipboard.writeText(sampleJsonSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-cyan-100 rounded-lg border border-cyan-300 shadow-sm">
              <FileSpreadsheet className="w-5 h-5 text-cyan-700" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">Master Schedule File Structure & Format Guide</h3>
              <p className="text-[11px] text-slate-500 font-bold">Supported formats: Microsoft Excel (.xlsx/.xls), CSV (.csv), JSON (.json)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-900 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex space-x-2 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab('xlsx')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition border shadow-sm ${
              activeTab === 'xlsx' ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xlsx / .xls)</span>
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition border shadow-sm ${
              activeTab === 'csv' ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSV (.csv)</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition border shadow-sm ${
              activeTab === 'json' ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON Dataset (.json)</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'xlsx' && (
          <div className="space-y-3 text-xs text-slate-700">
            <p className="font-medium">
              The parser automatically detects header row keywords and unmerges multi-hour lab block cells across Excel sheets.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 shadow-inner">
              <h4 className="font-black text-cyan-800 text-xs uppercase tracking-wide">Required / Recognized Column Headers:</h4>
              <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-800 font-medium">
                <li><strong className="text-slate-950 font-black">KUMPULAN / SEKSYEN / CLASS:</strong> e.g. DKM1A, DKM3A</li>
                <li><strong className="text-slate-950 font-black">KOD KURSUS / CODE:</strong> e.g. DJJ10013, DBM10013</li>
                <li><strong className="text-slate-950 font-black">NAMA KURSUS / NAME:</strong> e.g. Engineering Drawing</li>
                <li><strong className="text-slate-950 font-black">HARI / DAY:</strong> ISNIN, SELASA, RABU, KHAMIS, JUMAAT, SABTU</li>
                <li><strong className="text-slate-950 font-black">MASA MULA / START:</strong> e.g. 08:00, 10:00</li>
                <li><strong className="text-slate-950 font-black">MASA TAMAT / END:</strong> e.g. 10:00, 12:00</li>
                <li><strong className="text-slate-950 font-black">BILIK / VENUE:</strong> e.g. Bengkel Lukisan 1, BK 01</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'csv' && (
          <div className="space-y-3 text-xs text-slate-700">
            <p className="font-medium">
              Upload standard Comma-Separated Values (.csv) exported from Google Sheets, Microsoft Excel, or academic portals.
            </p>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1 overflow-x-auto shadow-md">
              <p className="text-slate-500">// Sample CSV Row Structure:</p>
              <p>SEKSYEN,KOD KURSUS,NAMA KURSUS,HARI,MASA MULA,MASA TAMAT,LOKASI</p>
              <p>DKM1A,DJJ10013,Engineering Drawing,ISNIN,08:00,10:00,Bengkel Lukisan 1</p>
              <p>DKM3A,DJJ30083,Fluid Mechanics,ISNIN,08:00,10:00,Makmal Bendalir</p>
            </div>
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <p className="font-medium">JSON structure expects an array of timetable slot objects:</p>
              <button
                onClick={copyJson}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black border border-slate-300 transition shadow-sm active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Sample JSON'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto max-h-56 scrollbar-thin shadow-md">
              {sampleJsonSnippet}
            </pre>
          </div>
        )}

        {/* FOOTER */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black border border-slate-200 transition active:scale-95 shadow-sm"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
