import React from 'react';
import { StudentProfile } from '../../types';

interface BorangPK01Props {
  studentProfile: StudentProfile;
  phoneNo: string;
  setPhoneNo: (val: string) => void;
  baseCourses: Array<{ code: string; name: string; credits: number; section: string }>;
  totalBaseCredits: number;
  repeatDetails: Array<{
    bil: number;
    code: string;
    courseName: string;
    section: string;
    creditHours: number;
    lecturer: string;
  }>;
  totalRepeatCredits: number;
  totalOverallCredits: number;
  courseStatuses: Record<string, 'D' | 'MK1' | 'MK2'>;
  setCourseStatuses: (statuses: Record<string, 'D' | 'MK1' | 'MK2'>) => void;
  lecturerNotes: Record<string, string>;
  setLecturerNotes: (notes: Record<string, string>) => void;
}

export const BorangPK01: React.FC<BorangPK01Props> = ({
  studentProfile,
  phoneNo,
  setPhoneNo,
  baseCourses,
  totalBaseCredits,
  repeatDetails,
  totalRepeatCredits,
  totalOverallCredits,
  courseStatuses,
  setCourseStatuses,
  lecturerNotes,
  setLecturerNotes
}) => {
  return (
    <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-300 max-w-4xl mx-auto space-y-5 font-sans relative overflow-hidden print:p-0 print:shadow-none print:border-none print:max-w-none">
      
      {/* TOP RIGHT FORM ID */}
      <div className="flex justify-end no-print-margin">
        <div className="border border-slate-900 px-3 py-1 font-bold text-xs font-mono">
          Borang PK01
        </div>
      </div>

      {/* OFFICIAL HEADER & LOGO */}
      <div className="text-center space-y-1 border-b-2 border-slate-900 pb-3">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 rounded bg-red-700 text-white font-extrabold flex items-center justify-center text-xs tracking-tighter">
            POLI
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-wider uppercase text-slate-900 leading-tight">
              POLITEKNIK MALAYSIA
            </h2>
            <h3 className="text-xs font-bold text-slate-700 uppercase">KUCHING SARAWAK</h3>
          </div>
        </div>
        <h1 className="text-sm font-extrabold tracking-wide uppercase text-slate-900 pt-2">
          BORANG PENDAFTARAN KURSUS
        </h1>
        <p className="text-xs font-bold text-rose-700 italic">
          (*Bagi kes pelajar menumpang seksyen)
        </p>
      </div>

      {/* STUDENT METADATA HEADER GRID */}
      <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs font-mono border border-slate-400 p-3 bg-slate-50/60 rounded">
        <div className="flex space-x-2">
          <span className="font-bold w-28 text-slate-700">JABATAN</span>
          <span>: {studentProfile.department || 'JABATAN KEJURUTERAAN MEKANIKAL'}</span>
        </div>
        <div className="flex space-x-2">
          <span className="font-bold w-28 text-slate-700">SESI</span>
          <span>: {studentProfile.session || 'SESI I: 2026/2027'}</span>
        </div>
        <div className="flex space-x-2 col-span-2">
          <span className="font-bold w-28 text-slate-700">NAMA</span>
          <span>: {studentProfile.name?.toUpperCase() || 'PELAJAR'}</span>
        </div>
        <div className="flex space-x-2">
          <span className="font-bold w-28 text-slate-700">NO. PENDAFTARAN</span>
          <span>: {studentProfile.matrixNo || 'N/A'}</span>
        </div>
        <div className="flex space-x-2">
          <span className="font-bold w-28 text-slate-700">PROGRAM</span>
          <span>: {studentProfile.program || 'DKM'}</span>
        </div>
        <div className="flex space-x-2">
          <span className="font-bold w-28 text-slate-700">NO. TEL</span>
          <span>: 
            <input
              type="text"
              value={phoneNo}
              onChange={e => setPhoneNo(e.target.value)}
              className="bg-transparent border-b border-dashed border-slate-400 focus:outline-none px-1 font-mono text-xs w-36 no-print-border"
            />
          </span>
        </div>
      </div>

      {/* SECTION (A): SENARAI KURSUS (SEKSYEN SEMASA) */}
      <div className="space-y-1.5">
        <h4 className="font-bold text-xs text-slate-900 uppercase">
          (A) SENARAI KURSUS (SEKSYEN SEMASA) :
        </h4>

        <table className="w-full text-left text-xs border-collapse border border-slate-900">
          <thead className="bg-slate-200 text-slate-900 font-bold uppercase border-b border-slate-900">
            <tr>
              <th className="p-1.5 border-r border-slate-900 text-center w-10">BIL</th>
              <th className="p-1.5 border-r border-slate-900 w-28">KOD KURSUS</th>
              <th className="p-1.5 border-r border-slate-900">NAMA KURSUS</th>
              <th className="p-1.5 border-r border-slate-900 text-center w-32">SEKSYEN <span className="text-[9px] font-normal block">(Contoh: DKA3-S2)</span></th>
              <th className="p-1.5 border-r border-slate-900 text-center w-20">STATUS</th>
              <th className="p-1.5 text-center w-24">JAM KREDIT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {baseCourses.map((c, i) => (
              <tr key={c.code}>
                <td className="p-1.5 border-r border-slate-900 text-center font-mono font-bold">{i + 1}</td>
                <td className="p-1.5 border-r border-slate-900 font-mono font-bold text-blue-900">{c.code}</td>
                <td className="p-1.5 border-r border-slate-900 font-medium">{c.name}</td>
                <td className="p-1.5 border-r border-slate-900 text-center font-mono font-bold">{c.section}</td>
                <td className="p-1.5 border-r border-slate-900 text-center font-mono font-bold">D</td>
                <td className="p-1.5 text-center font-mono font-bold">{c.credits}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 font-bold border-t border-slate-900">
            <tr>
              <td colSpan={5} className="p-1.5 text-right font-bold uppercase">JUMLAH JAM KREDIT :</td>
              <td className="p-1.5 text-center font-mono font-extrabold text-sm">{totalBaseCredits}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* SECTION (B): SENARAI KURSUS (SEKSYEN TUMPANG) */}
      <div className="space-y-1.5">
        <h4 className="font-bold text-xs text-slate-900 uppercase">
          (B) SENARAI KURSUS (SEKSYEN TUMPANG) :
        </h4>

        <table className="w-full text-left text-xs border-collapse border border-slate-900">
          <thead className="bg-slate-200 text-slate-900 font-bold uppercase border-b border-slate-900">
            <tr>
              <th className="p-1.5 border-r border-slate-900 text-center w-10">BIL</th>
              <th className="p-1.5 border-r border-slate-900 w-28">KOD KURSUS</th>
              <th className="p-1.5 border-r border-slate-900">NAMA KURSUS</th>
              <th className="p-1.5 border-r border-slate-900 text-center w-28">SEKSYEN TUMPANG <span className="text-[9px] font-normal block">(Contoh: DKA3-S2)</span></th>
              <th className="p-1.5 border-r border-slate-900">NAMA DAN T/T PENSYARAH</th>
              <th className="p-1.5 border-r border-slate-900 text-center w-16">STATUS</th>
              <th className="p-1.5 text-center w-24">JAM KREDIT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {repeatDetails.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-slate-500 italic">
                  Tiada kursus menumpang seksyen dipilih. Sila pilih kursus mengulang di Clash Resolver.
                </td>
              </tr>
            ) : (
              repeatDetails.map(item => (
                <tr key={item.code}>
                  <td className="p-1.5 border-r border-slate-900 text-center font-mono font-bold">{item.bil}</td>
                  <td className="p-1.5 border-r border-slate-900 font-mono font-bold text-blue-900">{item.code}</td>
                  <td className="p-1.5 border-r border-slate-900 font-medium">{item.courseName}</td>
                  <td className="p-1.5 border-r border-slate-900 text-center font-mono font-bold text-amber-900 bg-amber-50">{item.section}</td>
                  <td className="p-1.5 border-r border-slate-900 text-[11px]">
                    <input
                      type="text"
                      placeholder="Nama Pensyarah Subjek"
                      value={lecturerNotes[item.code] || item.lecturer}
                      onChange={e => setLecturerNotes({ ...lecturerNotes, [item.code]: e.target.value })}
                      className="w-full bg-transparent focus:outline-none border-b border-dotted border-slate-400 no-print-border font-sans"
                    />
                  </td>
                  <td className="p-1.5 border-r border-slate-900 text-center font-mono font-bold">
                    <select
                      value={courseStatuses[item.code] || 'MK1'}
                      onChange={e => setCourseStatuses({ ...courseStatuses, [item.code]: e.target.value as any })}
                      className="bg-transparent focus:outline-none font-mono font-bold text-xs no-print-border cursor-pointer"
                    >
                      <option value="D">D</option>
                      <option value="MK1">MK1</option>
                      <option value="MK2">MK2</option>
                    </select>
                  </td>
                  <td className="p-1.5 text-center font-mono font-bold">{item.creditHours}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-100 font-bold border-t border-slate-900">
            <tr>
              <td colSpan={6} className="p-1.5 text-right font-bold uppercase">JUMLAH JAM KREDIT :</td>
              <td className="p-1.5 text-center font-mono font-extrabold text-sm">{totalRepeatCredits}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* TOTAL OVERALL CREDITS */}
      <div className="flex justify-between items-center bg-slate-200 border-2 border-slate-900 p-2 font-extrabold text-xs uppercase">
        <span>JUMLAH JAM KREDIT KESELURUHAN (A + B) :</span>
        <span className={`font-mono text-base px-3 py-0.5 rounded ${
          totalOverallCredits > 20 ? 'bg-rose-200 text-rose-900 border border-rose-600' : 'bg-slate-900 text-white'
        }`}>
          {totalOverallCredits} JAM KREDIT
        </span>
      </div>

      {/* SIGNATURE APPROVAL BOXES */}
      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-400 text-[10px]">
        {/* COLUMN 1: STUDENT */}
        <div className="space-y-12">
          <div className="h-4"></div>
          <div className="space-y-1">
            <div className="border-b border-slate-900 w-full"></div>
            <p className="font-bold text-slate-900">Nama Pelajar : <span className="font-mono">{studentProfile.name}</span></p>
            <p className="font-bold text-slate-900">Tarikh : <span className="font-mono">{new Date().toLocaleDateString('ms-MY')}</span></p>
          </div>
        </div>

        {/* COLUMN 2: PA */}
        <div className="space-y-12">
          <div>
            <p className="font-bold text-slate-900">Disokong Penasihat Akademik</p>
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-900 w-full"></div>
            <p className="text-slate-900 font-bold">Tandatangan & Cop</p>
            <p className="text-slate-900 font-bold">Tarikh :</p>
          </div>
        </div>

        {/* COLUMN 3: KJ/PKJ */}
        <div className="space-y-12">
          <div>
            <p className="font-bold text-slate-900">Diluluskan KJ / PKJ / Kpro / KK</p>
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-900 w-full"></div>
            <p className="text-slate-900 font-bold">Tandatangan & Cop</p>
            <p className="text-slate-900 font-bold">Tarikh :</p>
          </div>
        </div>
      </div>

      {/* OFFICIAL NOTA & LEGEND FOOTER */}
      <div className="border-t border-slate-400 pt-3 text-[10px] text-slate-700 leading-tight space-y-1">
        <p className="font-bold uppercase text-slate-900">NOTA :</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Borang ini perlu diisi oleh pelajar yang menumpang seksyen selain daripada seksyen semasanya selewat-lewatnya pada minggu pertama Perkuliahan.</li>
          <li>Jika jumlah jam kredit kurang dari 12 jam kredit atau melebihi 20 jam kredit, pelajar perlu mendapat kebenaran Ketua Jabatan.</li>
          <li>Sila kembalikan borang ini yang telah lengkap di isi berserta salinan Slip Pengesahan Pendaftan Kursus selewat-lewatnya pada Minggu Pertama Perkuliahan kepada Penasihat Akademik (PA) atau Pegawai Pendaftaran Kursus Jabatan (PPKJ).</li>
          <li>Salinan asal borang ini perlu disimpan oleh PPKJ di sepanjang sesi pengajian.</li>
        </ul>
        <p className="pt-1 font-mono text-[9.5px] text-slate-600 border-t border-slate-300 mt-2">
          Status : <strong>D</strong> – Daftar kali pertama; <strong>MK1</strong> – MengulangKursus kali pertama; <strong>MK2</strong> – MengulangKursus kali kedua.
        </p>
      </div>

    </div>
  );
};
