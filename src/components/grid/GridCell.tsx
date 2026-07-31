import React from 'react';
import { TimetableSlot } from '../../types';
import { ExternalLink } from 'lucide-react';
import { generateGoogleCalendarUrl } from '../../utils/calendarExport';

interface GridCellProps {
  activeSlots: TimetableSlot[];
  clashSlotsMap: Map<string, boolean>;
  style: any;
}

export const GridCell: React.FC<GridCellProps> = ({
  activeSlots,
  clashSlotsMap,
  style
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full h-full min-h-[85px]">
      {activeSlots.map(slot => {
        const isClash = clashSlotsMap.get(slot.id);

        return (
          <div
            key={slot.id}
            className={`p-1.5 rounded-md border text-[10px] font-sans flex flex-col justify-between transition shadow-sm overflow-hidden min-h-[75px] ${
              isClash
                ? 'bg-rose-50 border-rose-400 text-rose-900 animate-pulse font-black'
                : slot.isRepeat
                ? 'bg-amber-50 border-amber-400 text-amber-900 hover:border-amber-600 font-black'
                : style.baseSlotClass
            }`}
          >
            <div>
              <div className="flex items-center justify-between font-mono">
                <span className="font-black tracking-tight text-[11px]">{slot.courseCode}</span>
                <span className="text-[9px] px-1 rounded bg-slate-200/80 text-slate-800 font-black">{slot.section}</span>
              </div>
              <p className="text-[10px] font-bold leading-tight mt-0.5 line-clamp-2">
                {slot.courseName}
              </p>
            </div>

            <div className="mt-1 pt-0.5 border-t border-slate-200 text-[9px] flex items-center justify-between text-slate-500 font-bold">
              <span className="truncate max-w-[60px]">{slot.venue}</span>
              <a
                href={generateGoogleCalendarUrl(slot)}
                target="_blank"
                rel="noreferrer"
                className="p-0.5 rounded hover:bg-slate-200 text-slate-700 transition"
                title="Add to Google Calendar"
              >
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};
