import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App gracefully
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Workspace scopes for Google Drive
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.appdata');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

/**
 * Initialize auth state listener.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Perform sign-in with popup to obtain Google Drive access token.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Return cached token in memory.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Sign out user and clear cached token.
 */
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * List saved timetable files in Google Drive.
 */
export const listDriveTimetables = async (): Promise<DriveFileInfo[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const query = encodeURIComponent("trashed = false and (mimeType = 'application/json' or mimeType = 'text/calendar' or name contains 'Politeknik')");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to list Google Drive files');
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Read contents of a saved timetable file from Google Drive.
 */
export const readDriveFileContent = async (fileId: string): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to download file from Google Drive');
  }

  return await res.text();
};

/**
 * Save a new timetable file to Google Drive.
 */
export const saveTimetableToDrive = async (
  fileName: string,
  content: string,
  mimeType: string = 'application/json'
): Promise<DriveFileInfo> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: 'Politeknik Academic Timetable & Clash Resolution Schedule File'
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`
      },
      body: multipartRequestBody
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to upload timetable to Google Drive');
  }

  return await res.json();
};

/**
 * Overwrite an existing timetable file on Google Drive.
 * NOTE: Caller MUST present user confirmation modal before invoking this destructive update.
 */
export const updateDriveTimetable = async (
  fileId: string,
  content: string,
  mimeType: string = 'application/json'
): Promise<DriveFileInfo> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,name,mimeType,modifiedTime,webViewLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': mimeType
      },
      body: content
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to update file on Google Drive');
  }

  return await res.json();
};

/**
 * Delete a timetable file from Google Drive.
 * NOTE: Caller MUST present user confirmation modal before invoking this destructive deletion.
 */
export const deleteDriveTimetable = async (fileId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to delete file from Google Drive');
  }
};
