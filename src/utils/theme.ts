import { ThemePalette } from '../types';

export interface PaletteStyle {
  bgClass: string;          // Global page body bg
  cardBgClass: string;      // Card/panel bg & border
  borderColor: string;      // Secondary/card borders
  textPrimary: string;      // Main typography color
  textSecondary: string;    // Muted/secondary text
  bgMuted: string;          // Form sections & internal container background
  inputClass: string;       // Style for text inputs, select dropdowns
  accentText: string;       // Highlighted text (e.g. text-cyan-600)
  accentBg: string;         // Core buttons & solid fills (e.g. bg-cyan-600)
  accentHoverBg: string;    // Hover state for solid fills (e.g. hover:bg-cyan-500)
  accentBorder: string;     // Accent border outlines (e.g. border-cyan-500/50)
  badgeClass: string;       // Badges and chips
  gradientClass: string;    // Header icon gradient
  tabActiveBg: string;      // Selected nav tab background & border
  selectionBg: string;      // Text selection styles
  btnClass: string;         // Custom theme-ready secondary buttons
  baseSlotClass: string;    // Base class slots in timetable
  legendBaseBg: string;     // Color dot in weekly schedule legend
  tabStyle: string;         // Extra style customization for tabs
}

export const PALETTES: Record<ThemePalette, PaletteStyle> = {
  cyber: {
    bgClass: 'bg-slate-50/70 text-slate-950',
    cardBgClass: 'bg-white border-slate-200/90 text-slate-800 shadow-sm',
    borderColor: 'border-slate-200',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-slate-500',
    bgMuted: 'bg-slate-50 border border-slate-100',
    inputClass: 'bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20',
    accentText: 'text-cyan-600 font-semibold',
    accentBg: 'bg-cyan-600 text-white font-bold',
    accentHoverBg: 'hover:bg-cyan-500',
    accentBorder: 'border-cyan-500/40',
    badgeClass: 'bg-cyan-100/75 text-cyan-800 border border-cyan-200/70',
    gradientClass: 'from-cyan-500 to-blue-600 shadow-cyan-200/50',
    tabActiveBg: 'bg-cyan-50 text-cyan-700 border border-cyan-200/80',
    selectionBg: 'selection:bg-cyan-100 selection:text-cyan-900',
    btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm',
    baseSlotClass: 'bg-blue-50 border-blue-200 text-blue-900 hover:border-blue-400 shadow-sm',
    legendBaseBg: 'bg-blue-500 border-blue-400',
    tabStyle: 'text-slate-600 hover:text-slate-950',
  },
  emerald: {
    bgClass: 'bg-emerald-50/40 text-slate-950',
    cardBgClass: 'bg-white border-emerald-100/90 text-slate-850 shadow-sm',
    borderColor: 'border-emerald-100',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-slate-500',
    bgMuted: 'bg-emerald-50/55 border border-emerald-100/50',
    inputClass: 'bg-white border border-emerald-200 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20',
    accentText: 'text-emerald-700 font-semibold',
    accentBg: 'bg-emerald-600 text-white font-bold',
    accentHoverBg: 'hover:bg-emerald-500',
    accentBorder: 'border-emerald-500/40',
    badgeClass: 'bg-emerald-100/75 text-emerald-800 border border-emerald-200/70',
    gradientClass: 'from-emerald-500 to-teal-600 shadow-emerald-200/50',
    tabActiveBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    selectionBg: 'selection:bg-emerald-100 selection:text-emerald-900',
    btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm',
    baseSlotClass: 'bg-teal-50 border-teal-200 text-teal-900 hover:border-teal-400 shadow-sm',
    legendBaseBg: 'bg-teal-500 border-teal-400',
    tabStyle: 'text-slate-600 hover:text-emerald-950',
  },
  midnight: {
    bgClass: 'bg-indigo-50/30 text-slate-950',
    cardBgClass: 'bg-white border-indigo-100/90 text-slate-850 shadow-sm',
    borderColor: 'border-indigo-100',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-slate-500',
    bgMuted: 'bg-indigo-50/45 border border-indigo-100/50',
    inputClass: 'bg-white border border-indigo-200 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20',
    accentText: 'text-violet-700 font-semibold',
    accentBg: 'bg-violet-600 text-white font-bold',
    accentHoverBg: 'hover:bg-violet-500',
    accentBorder: 'border-violet-500/40',
    badgeClass: 'bg-violet-100 text-violet-800 border border-violet-200',
    gradientClass: 'from-violet-500 to-indigo-600 shadow-violet-200/50',
    tabActiveBg: 'bg-violet-50 text-violet-800 border border-violet-200/80',
    selectionBg: 'selection:bg-violet-100 selection:text-violet-900',
    btnClass: 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm',
    baseSlotClass: 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:border-indigo-400 shadow-sm',
    legendBaseBg: 'bg-indigo-500 border-indigo-400',
    tabStyle: 'text-slate-600 hover:text-violet-950',
  },
  amber: {
    bgClass: 'bg-stone-50/80 text-stone-955',
    cardBgClass: 'bg-white border-stone-200/95 text-stone-850 shadow-sm',
    borderColor: 'border-stone-200',
    textPrimary: 'text-stone-800',
    textSecondary: 'text-stone-500',
    bgMuted: 'bg-stone-100/60 border border-stone-200/45',
    inputClass: 'bg-white border border-stone-200 text-stone-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20',
    accentText: 'text-amber-700 font-semibold',
    accentBg: 'bg-amber-600 text-stone-950 font-bold',
    accentHoverBg: 'hover:bg-amber-500',
    accentBorder: 'border-amber-500/40',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-200',
    gradientClass: 'from-amber-500 to-yellow-600 shadow-amber-200/50',
    tabActiveBg: 'bg-amber-50 text-amber-900 border border-amber-200/80',
    selectionBg: 'selection:bg-amber-100 selection:text-amber-900',
    btnClass: 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold shadow-sm',
    baseSlotClass: 'bg-stone-50 border-stone-300 text-stone-900 hover:border-stone-400 shadow-sm',
    legendBaseBg: 'bg-stone-500 border-stone-400',
    tabStyle: 'text-stone-600 hover:text-stone-950',
  },
  contrast: {
    bgClass: 'bg-white text-black',
    cardBgClass: 'bg-white border-2 border-black text-black shadow-sm',
    borderColor: 'border-black',
    textPrimary: 'text-black',
    textSecondary: 'text-zinc-700',
    bgMuted: 'bg-zinc-50 border border-zinc-200',
    inputClass: 'bg-white border-2 border-black text-black focus:outline-none',
    accentText: 'text-black font-extrabold',
    accentBg: 'bg-black text-white font-bold',
    accentHoverBg: 'hover:bg-zinc-800',
    accentBorder: 'border-black',
    badgeClass: 'bg-white text-black border-2 border-black',
    gradientClass: 'from-black to-zinc-800 shadow-zinc-200/50',
    tabActiveBg: 'bg-zinc-100 text-black border-2 border-black',
    selectionBg: 'selection:bg-black selection:text-white',
    btnClass: 'bg-black hover:bg-zinc-800 text-white font-bold',
    baseSlotClass: 'bg-white border-2 border-zinc-800 text-zinc-950 hover:border-black shadow-sm',
    legendBaseBg: 'bg-zinc-900 border-black',
    tabStyle: 'text-zinc-700 hover:text-black',
  }
};

export const getThemePalette = (palette: ThemePalette = 'cyber'): PaletteStyle => {
  return PALETTES[palette] || PALETTES.cyber;
};
