import React from 'react';
import { ThemePreferences, ThemePalette, ThemeFont } from '../types';
import { Palette, Type, Check, X, Sparkles } from 'lucide-react';
import { getThemePalette } from '../utils/theme';

interface ThemeCustomizerProps {
  isOpen?: boolean;
  themePrefs: ThemePreferences;
  setThemePrefs: (prefs: ThemePreferences) => void;
  onClose: () => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  isOpen = true,
  themePrefs,
  setThemePrefs,
  onClose
}) => {
  if (!isOpen) return null;
  const style = getThemePalette(themePrefs.palette);

  const palettes: { id: ThemePalette; name: string; colorBg: string; colorAccent: string; colorBorder: string }[] = [
    { id: 'cyber', name: 'Cyber Slate & Cyan', colorBg: 'bg-slate-50', colorAccent: 'bg-cyan-600', colorBorder: 'border-cyan-500/60' },
    { id: 'emerald', name: 'Campus Emerald', colorBg: 'bg-emerald-50', colorAccent: 'bg-emerald-600', colorBorder: 'border-emerald-500/60' },
    { id: 'midnight', name: 'Midnight Indigo', colorBg: 'bg-indigo-50', colorAccent: 'bg-violet-600', colorBorder: 'border-violet-500/60' },
    { id: 'amber', name: 'Warm Gold & Stone', colorBg: 'bg-stone-50', colorAccent: 'bg-amber-600', colorBorder: 'border-amber-500/60' },
    { id: 'contrast', name: 'Stark High Contrast', colorBg: 'bg-zinc-50', colorAccent: 'bg-black', colorBorder: 'border-black' }
  ];

  const fonts: { id: ThemeFont; name: string; classFont: string; previewText: string }[] = [
    { id: 'sans', name: 'Plus Jakarta Sans (Modern UI)', classFont: 'font-sans', previewText: 'DJJ10013 Engineering Drawing' },
    { id: 'mono', name: 'JetBrains / Engineer Mono', classFont: 'font-mono', previewText: 'DKM3A [08:00 - 10:00]' },
    { id: 'serif', name: 'Academic Serif Antiqua', classFont: 'font-serif', previewText: 'Jabatan Kejuruteraan Mekanikal' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 no-print">
      <div className={`${style.cardBgClass} border rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4`}>
        
        {/* HEADER */}
        <div className={`flex items-center justify-between border-b ${style.borderColor} pb-3`}>
          <div className="flex items-center space-x-2">
            <Palette className={`w-4 h-4 ${style.accentText}`} />
            <h3 className={`font-bold ${style.textPrimary} text-sm`}>Timetable Grid Visual Theme</h3>
          </div>
          <button onClick={onClose} className={`p-1 rounded-md ${style.textSecondary} hover:${style.accentText}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PALETTE OPTIONS */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold ${style.textSecondary} flex items-center space-x-1.5`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Color Palette</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {palettes.map(p => {
              const isSelected = themePrefs.palette === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    const next = { ...themePrefs, palette: p.id };
                    setThemePrefs(next);
                    localStorage.setItem('jkm_timetable_theme_prefs', JSON.stringify(next));
                  }}
                  className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? `${p.colorBg} ${p.colorBorder} shadow-sm font-bold`
                      : `${style.cardBgClass} hover:border-slate-300`
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-4 h-4 rounded-full ${p.colorAccent} inline-block shadow-sm`} />
                    <span className={`text-xs ${style.textPrimary}`}>{p.name}</span>
                  </div>
                  {isSelected && <Check className={`w-4 h-4 ${style.accentText}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* FONT OPTIONS */}
        <div className={`space-y-2 pt-2 border-t ${style.borderColor}`}>
          <label className={`text-xs font-semibold ${style.textSecondary} flex items-center space-x-1.5`}>
            <Type className={`w-3.5 h-3.5 ${style.accentText}`} />
            <span>Select Typography Style</span>
          </label>
          <div className="space-y-2">
            {fonts.map(f => {
              const isSelected = themePrefs.font === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => {
                    const next = { ...themePrefs, font: f.id };
                    setThemePrefs(next);
                    localStorage.setItem('jkm_timetable_theme_prefs', JSON.stringify(next));
                  }}
                  className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? `${style.bgMuted} ${style.accentBorder}`
                      : `${style.cardBgClass} hover:border-slate-300`
                  }`}
                >
                  <div>
                    <span className={`text-xs font-semibold ${style.textPrimary} block mb-0.5`}>{f.name}</span>
                    <span className={`text-[11px] ${style.textSecondary} ${f.classFont}`}>{f.previewText}</span>
                  </div>
                  {isSelected && <Check className={`w-4 h-4 ${style.accentText}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className={`w-full py-2 rounded-lg ${style.btnClass} text-xs font-bold transition`}
          >
            Apply Visual Customization
          </button>
        </div>

      </div>
    </div>
  );
};
