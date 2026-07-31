import React, { useState, useEffect } from 'react';
import { TimetableSlot, ThemePreferences } from '../types';
import { getThemePalette } from '../utils/theme';
import {
  initAuth,
  googleSignIn,
  logout,
  listDriveTimetables,
  saveTimetableToDrive,
  updateDriveTimetable,
  deleteDriveTimetable,
  readDriveFileContent,
  DriveFileInfo
} from '../utils/googleDrive';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  Trash2,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  ExternalLink,
  LogOut,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterSlots: TimetableSlot[];
  selectedAddons: TimetableSlot[];
  studentName: string;
  baseSection: string;
  onRestoreSchedule?: (savedData: {
    baseSection: string;
    studentName: string;
    selectedAddons: TimetableSlot[];
  }) => void;
  themePrefs?: ThemePreferences;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  masterSlots,
  selectedAddons,
  studentName,
  baseSection,
  onRestoreSchedule,
  themePrefs
}) => {
  const style = getThemePalette(themePrefs?.palette);

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileInfo[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Save form state
  const [newFileName, setNewFileName] = useState<string>(
    `Timetable_${baseSection || 'DKM'}_${new Date().toISOString().split('T')[0]}.json`
  );
  const [isSaving, setIsSaving] = useState(false);

  // Destructive Confirmation Modal state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'DELETE' | 'OVERWRITE';
    file: DriveFileInfo;
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setAccessToken(token);
        fetchFilesList();
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchFilesList();
    }
  }, [isOpen, accessToken]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        await fetchFilesList();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Drive authentication failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setDriveFiles([]);
  };

  const fetchFilesList = async () => {
    setErrorMsg(null);
    setIsLoadingFiles(true);
    try {
      const files = await listDriveTimetables();
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Unable to load Google Drive files.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSaveNewToDrive = async () => {
    if (!newFileName.trim()) {
      setErrorMsg('Please specify a valid file name.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSaving(true);
    try {
      const payload = {
        version: '1.0',
        savedAt: new Date().toISOString(),
        studentName,
        baseSection,
        selectedAddons
      };

      const finalName = newFileName.endsWith('.json') ? newFileName : `${newFileName}.json`;
      const created = await saveTimetableToDrive(finalName, JSON.stringify(payload, null, 2));

      setSuccessMsg(`Timetable "${created.name}" saved to Google Drive successfully!`);
      await fetchFilesList();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save timetable to Google Drive.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadFromDrive = async (file: DriveFileInfo) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const text = await readDriveFileContent(file.id);
      const parsed = JSON.parse(text);
      if (onRestoreSchedule && parsed.selectedAddons) {
        onRestoreSchedule({
          baseSection: parsed.baseSection || baseSection,
          studentName: parsed.studentName || studentName,
          selectedAddons: parsed.selectedAddons || []
        });
        setSuccessMsg(`Timetable "${file.name}" loaded into workspace successfully!`);
      } else {
        setErrorMsg('Invalid timetable file format.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read timetable from Google Drive.');
    }
  };

  // Execute Destructive Action after User Confirmation
  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    setIsProcessingAction(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (confirmAction.type === 'DELETE') {
        await deleteDriveTimetable(confirmAction.file.id);
        setSuccessMsg(`File "${confirmAction.file.name}" was deleted from your Google Drive.`);
      } else if (confirmAction.type === 'OVERWRITE') {
        const payload = {
          version: '1.0',
          updatedAt: new Date().toISOString(),
          studentName,
          baseSection,
          selectedAddons
        };
        await updateDriveTimetable(confirmAction.file.id, JSON.stringify(payload, null, 2));
        setSuccessMsg(`File "${confirmAction.file.name}" was overwritten with your current schedule.`);
      }
      setConfirmAction(null);
      await fetchFilesList();
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to ${confirmAction.type.toLowerCase()} Google Drive file.`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className={`${style.cardBgClass} border ${style.borderColor} rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] flex flex-col`}>
        
        {/* HEADER */}
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${style.borderColor} pb-4 flex-shrink-0`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-inner">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className={`font-bold ${style.textPrimary} text-base`}>Google Drive Cloud Timetables</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                  {user ? 'Connected' : 'Not Signed In'}
                </span>
              </div>
              <p className={`text-xs ${style.textSecondary} mt-0.5`}>
                Backup, restore, and sync your Politeknik academic timetables across devices via Google Drive.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${style.bgMuted} border ${style.borderColor} ${style.textPrimary} hover:brightness-95 transition`}
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900 font-bold ml-2">×</button>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold ml-2">×</button>
          </div>
        )}

        {/* BODY */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {!user || !accessToken ? (
            <div className={`p-8 text-center rounded-xl ${style.bgMuted} border ${style.borderColor} space-y-4`}>
              <Cloud className="w-12 h-12 text-cyan-600 mx-auto opacity-90" />
              <div className="space-y-1">
                <h3 className={`font-bold ${style.textPrimary} text-sm`}>Connect Google Drive</h3>
                <p className={`text-xs ${style.textSecondary} max-w-sm mx-auto`}>
                  Sign in with your Google Workspace account to securely backup and load your timetables from Google Drive.
                </p>
              </div>

              {/* Official Google Sign-In Material Button Styling */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="gsi-material-button inline-flex items-center space-x-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-5 py-2.5 text-slate-700 font-medium text-xs shadow-sm transition disabled:opacity-60"
                >
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-semibold">
                    {isLoggingIn ? 'Connecting to Google Drive...' : 'Sign in with Google'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* CONNECTED ACCOUNT STATUS */}
              <div className={`flex flex-wrap items-center justify-between p-3.5 rounded-xl ${style.bgMuted} border ${style.borderColor} gap-3`}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className={`font-bold ${style.textPrimary}`}>{user.displayName || 'Google Account'}</p>
                    <p className={style.textSecondary}>{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={fetchFilesList}
                    disabled={isLoadingFiles}
                    className={`p-1.5 rounded-lg ${style.bgMuted} border ${style.borderColor} ${style.textPrimary} hover:brightness-95 transition`}
                    title="Refresh Drive files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleGoogleLogout}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {/* SAVE NEW TIMETABLE TO DRIVE */}
              <div className={`p-4 rounded-xl ${style.bgMuted} border ${style.borderColor} space-y-3`}>
                <div className="flex items-center space-x-2">
                  <CloudUpload className="w-4 h-4 text-cyan-600" />
                  <h3 className={`font-bold ${style.textPrimary} text-xs uppercase tracking-wider`}>
                    Save Current Timetable to Google Drive
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={e => setNewFileName(e.target.value)}
                    placeholder="Enter file name (e.g. Sesi_1_2026_DKM3A.json)"
                    className={`${style.inputClass} flex-1 text-xs font-mono`}
                  />
                  <button
                    onClick={handleSaveNewToDrive}
                    disabled={isSaving || !newFileName.trim()}
                    className={`px-4 py-2 rounded-lg ${style.btnClass} text-xs font-semibold flex items-center justify-center space-x-1.5 disabled:opacity-50`}
                  >
                    <CloudUpload className="w-4 h-4" />
                    <span>{isSaving ? 'Uploading...' : 'Save to Drive'}</span>
                  </button>
                </div>
              </div>

              {/* SAVED FILES LIST IN GOOGLE DRIVE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold ${style.textPrimary} text-xs uppercase tracking-wider`}>
                    Saved Timetables in Google Drive ({driveFiles.length})
                  </h3>
                  {isLoadingFiles && (
                    <span className="text-xs text-cyan-600 font-mono animate-pulse">Scanning Google Drive...</span>
                  )}
                </div>

                {driveFiles.length === 0 ? (
                  <div className={`p-8 text-center rounded-xl ${style.bgMuted} border ${style.borderColor} text-xs ${style.textSecondary}`}>
                    No saved timetable files found in your Google Drive. Save your current schedule above to create one.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {driveFiles.map(file => (
                      <div
                        key={file.id}
                        className={`flex flex-wrap items-center justify-between p-3 rounded-xl ${style.bgMuted} border ${style.borderColor} gap-3 hover:border-cyan-400 transition`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className={`font-bold ${style.textPrimary} text-xs truncate`}>{file.name}</p>
                            <div className={`flex items-center space-x-3 text-[10px] ${style.textSecondary} font-mono mt-0.5`}>
                              <span>
                                {file.modifiedTime
                                  ? new Date(file.modifiedTime).toLocaleDateString() + ' ' + new Date(file.modifiedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : 'Saved in Drive'}
                              </span>
                              {file.size && <span>• {(Number(file.size) / 1024).toFixed(1)} KB</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className={`p-1.5 rounded-lg ${style.bgMuted} border ${style.borderColor} ${style.textSecondary} hover:text-cyan-600 transition`}
                              title="View file in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => handleLoadFromDrive(file)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition"
                            title="Load and restore this timetable schedule into workspace"
                          >
                            <CloudDownload className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>

                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: 'OVERWRITE',
                                file
                              })
                            }
                            className={`px-2.5 py-1 rounded-lg ${style.bgMuted} border ${style.borderColor} ${style.textPrimary} hover:border-cyan-500 text-xs font-semibold transition`}
                            title="Overwrite this Drive file with current schedule"
                          >
                            Overwrite
                          </button>

                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: 'DELETE',
                                file
                              })
                            }
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                            title="Delete file from Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className={`border-t ${style.borderColor} pt-3 flex items-center justify-between text-xs flex-shrink-0`}>
          <span className={`${style.textSecondary} text-[11px]`}>
            Secured by Google Workspace OAuth • Least-Privilege Scope Access
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg ${style.bgMuted} border ${style.borderColor} ${style.textPrimary} hover:brightness-95 font-semibold transition`}
          >
            Close
          </button>
        </div>
      </div>

      {/* MANDATORY USER CONFIRMATION MODAL FOR DESTRUCTIVE OPERATIONS */}
      {confirmAction && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Confirm {confirmAction.type === 'DELETE' ? 'Deletion' : 'Overwrite'} on Google Drive
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmAction.type === 'DELETE' ? (
                <>
                  Are you sure you want to permanently delete <strong>{confirmAction.file.name}</strong> from your Google Drive? This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to overwrite <strong>{confirmAction.file.name}</strong> on Google Drive with your current workspace schedule? Previous contents will be replaced.
                </>
              )}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={isProcessingAction}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                disabled={isProcessingAction}
                className={`px-4 py-1.5 rounded-lg text-white text-xs font-bold transition shadow-sm ${
                  confirmAction.type === 'DELETE'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {isProcessingAction
                  ? 'Processing...'
                  : confirmAction.type === 'DELETE'
                  ? 'Confirm Delete'
                  : 'Confirm Overwrite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
