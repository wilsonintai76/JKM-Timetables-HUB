import React, { useState } from 'react';
import { TimetableSlot, DayOfWeek, UserRole } from '../../types';
import { Plus, Trash2 } from 'lucide-react';
import { checkPolicy } from '../../utils/pbac';

interface SlotManagementPanelProps {
  masterSlots: TimetableSlot[];
  onAddSlot?: (slot: TimetableSlot) => void;
  onDeleteSlot?: (id: string) => void;
  userRole: UserRole;
}

export const SlotManagementPanel: React.FC<SlotManagementPanelProps> = ({
  masterSlots,
  onAddSlot,
  onDeleteSlot,
  userRole
}) => {
  const [newSection, setNewSection] = useState('DKM1A');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCreditHours, setNewCreditHours] = useState('3');
  const [newDay, setNewDay] = useState<DayOfWeek>('ISNIN');
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newVenue, setNewVenue] = useState('BK 01');
  const [newLecturer, setNewLecturer] = useState('En. Azman');

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName || !onAddSlot) return;

    const newSlot: TimetableSlot = {
      id: `admin_${Date.now()}`,
      section: newSection.toUpperCase().trim(),
      courseCode: newCourseCode.toUpperCase().trim(),
      courseName: newCourseName.trim(),
      creditHours: parseInt(newCreditHours, 10) || 3,
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      venue: newVenue.trim(),
      lecturer: newLecturer.trim()
    };

    onAddSlot(newSlot);
    setNewCourseCode('');
    setNewCourseName('');
  };

  const handleDeleteSlot = (id: string) => {
    if (onDeleteSlot) onDeleteSlot(id);
  };

  return (
    <div className="space-y-6">
      {/* ADD SLOT FORM */}
      <form onSubmit={handleAddSlot} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 shadow-sm">
        <h4 className="font-black text-xs text-amber-800 uppercase tracking-wider flex items-center space-x-1">
          <Plus className="w-4 h-4 text-amber-600" />
          <span>Add New Timetable Slot to Database</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 mb-1 font-black uppercase tracking-tighter text-[10px]">Seksyen / Kumpulan</label>
            <input
              type="text"
              placeholder="e.g. DKM1A"
              value={newSection}
              onChange={e => setNewSection(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-black focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-black uppercase tracking-tighter text-[10px]">Kod Kursus</label>
            <input
              type="text"
              placeholder="e.g. DJJ10013"
              value={newCourseCode}
              onChange={e => setNewCourseCode(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-black focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-black uppercase tracking-tighter text-[10px]">Nama Kursus</label>
            <input
              type="text"
              placeholder="e.g. Engineering Drawing"
              value={newCourseName}
              onChange={e => setNewCourseName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-extrabold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-black uppercase tracking-tighter text-[10px]">Hari Kelas</label>
            <select
              value={newDay}
              onChange={e => setNewDay(e.target.value as DayOfWeek)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-black cursor-pointer focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="ISNIN">ISNIN</option>
              <option value="SELASA">SELASA</option>
              <option value="RABU">RABU</option>
              <option value="KHAMIS">KHAMIS</option>
              <option value="JUMAAT">JUMAAT</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-black uppercase tracking-tighter text-[10px]">Masa Mula</label>
            <input
              type="text"
              placeholder="08:00"
              value={newStartTime}
              onChange={e => setNewStartTime(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-black focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-black uppercase tracking-tighter text-[10px]">Masa Tamat</label>
            <input
              type="text"
              placeholder="10:00"
              value={newEndTime}
              onChange={e => setNewEndTime(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-black focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-black uppercase tracking-tighter text-[10px]">Lokasi / Bilik</label>
            <input
              type="text"
              placeholder="Bengkel Lukisan 1"
              value={newVenue}
              onChange={e => setNewVenue(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-extrabold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-black uppercase tracking-tighter text-[10px]">Pensyarah</label>
            <input
              type="text"
              placeholder="En. Azman"
              value={newLecturer}
              onChange={e => setNewLecturer(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-extrabold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!checkPolicy(userRole, 'UPLOAD_MASTER_FILE')}
            className={`px-4 py-2 rounded-xl font-black text-xs flex items-center space-x-1.5 transition shadow-md active:scale-95 border ${
              checkPolicy(userRole, 'UPLOAD_MASTER_FILE')
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200 shadow-none'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Save Timetable Slot</span>
          </button>
        </div>
      </form>

      {/* SLOTS LIST SUMMARY */}
      <div className="space-y-2">
        <h4 className="font-black text-xs text-slate-900 uppercase tracking-wide">Current Database Entries ({masterSlots.length} Slots)</h4>
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 shadow-inner bg-slate-50 p-2 rounded-lg border border-slate-200">
          {masterSlots.slice(0, 50).map(slot => (
            <div
              key={slot.id}
              className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs hover:border-slate-400 transition shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <span className="font-black text-cyan-800 font-mono w-16">{slot.section}</span>
                <span className="font-black text-amber-800 font-mono w-24">{slot.courseCode}</span>
                <span className="text-slate-900 font-extrabold truncate max-w-[200px]">{slot.courseName}</span>
                <span className="text-slate-500 text-[11px] font-mono font-bold">
                  {slot.day} {slot.startTime}-{slot.endTime} ({slot.venue})
                </span>
              </div>

              {checkPolicy(userRole, 'UPLOAD_MASTER_FILE') && (
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Slot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
