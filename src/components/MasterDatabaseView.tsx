import React, { useState } from 'react';
import { TimetableSlot } from '../types';
import { exportMasterToExcel } from '../utils/excelParser';
import { Layers, Search, Download, Filter, Plus, Trash2, Edit, BookOpen } from 'lucide-react';

interface MasterDatabaseViewProps {
  masterSlots: TimetableSlot[];
  onExportExcel: () => void;
}

export const MasterDatabaseView: React.FC<MasterDatabaseViewProps> = ({
  masterSlots,
  onExportExcel
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('ALL');
  const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');

  const uniqueSections = Array.from(new Set(masterSlots.map(s => s.section))).sort();
  const uniqueDays = Array.from(new Set(masterSlots.map(s => s.day))).sort();

  const filteredSlots = masterSlots.filter(s => {
    const matchesSearch =
      s.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.lecturer && s.lecturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.venue && s.venue.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSection = selectedSectionFilter === 'ALL' || s.section === selectedSectionFilter;
    const matchesDay = selectedDayFilter === 'ALL' || s.day === selectedDayFilter;

    return matchesSearch && matchesSection && matchesDay;
  });

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-lg space-y-3.5 no-print">

      {/* HEADER & CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-cyan-100 rounded-lg border border-cyan-300 shadow-sm">
              <Layers className="w-4 h-4 text-cyan-700" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">JKM Master Timetable Database</h3>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5 font-bold">
            Displaying <span className="text-cyan-700">{filteredSlots.length}</span> of <span className="text-slate-900 font-black">{masterSlots.length}</span> entries extracted from master sheet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Filter code, section, room..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 w-44 sm:w-56 font-medium shadow-sm"
            />
          </div>

          {/* Section Filter Dropdown */}
          <select
            value={selectedSectionFilter}
            onChange={e => setSelectedSectionFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-black text-slate-700 focus:outline-none focus:border-cyan-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">All Sections ({uniqueSections.length})</option>
            {uniqueSections.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>

          {/* Day Filter */}
          <select
            value={selectedDayFilter}
            onChange={e => setSelectedDayFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-black text-slate-700 focus:outline-none focus:border-cyan-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">All Days</option>
            {uniqueDays.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Export to Excel */}
          <button
            onClick={() => exportMasterToExcel(masterSlots, 'JKM_Master_Schedule_Exported.xlsx')}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-md active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* MASTER DATA TABLE */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-[520px] shadow-inner bg-slate-50">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 sticky top-0 border-b border-slate-300 text-slate-600 font-mono text-[11px] z-10">
            <tr>
              <th className="p-2 w-10 text-center font-black">#</th>
              <th className="p-2 font-black">SEKSYEN</th>
              <th className="p-2 font-black">KOD KURSUS</th>
              <th className="p-2 font-black">NAMA KURSUS</th>
              <th className="p-2 text-center font-black">KREDIT</th>
              <th className="p-2 font-black">HARI</th>
              <th className="p-2 font-black">MASA</th>
              <th className="p-2 font-black">LOKASI / BILIK</th>
              <th className="p-2 font-black">PENSYARAH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono bg-white text-[11px]">
            {filteredSlots.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500 font-sans italic font-medium">
                  No timetable slots found matching query "{searchQuery}"
                </td>
              </tr>
            ) : (
              filteredSlots.map((slot, idx) => (
                <tr key={slot.id} className="hover:bg-slate-50 text-slate-700 transition">
                  <td className="p-2 text-center text-slate-400 text-[10px] font-bold">{idx + 1}</td>
                  <td className="p-2 font-black text-cyan-800">{slot.section}</td>
                  <td className="p-2 font-black text-amber-800">{slot.courseCode}</td>
                  <td className="p-2 font-sans font-extrabold text-slate-900">{slot.courseName}</td>
                  <td className="p-2 text-center text-slate-600 font-bold">{slot.creditHours || 3}</td>
                  <td className="p-2 font-black text-slate-900">{slot.day}</td>
                  <td className="p-2 text-slate-600 font-bold">{slot.startTime} - {slot.endTime}</td>
                  <td className="p-2 text-slate-800 font-sans font-bold">{slot.venue}</td>
                  <td className="p-2 text-slate-500 font-sans font-medium">{slot.lecturer || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
