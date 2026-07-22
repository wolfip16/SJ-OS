import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getCachedAccessToken = (): string | null => cachedAccessToken;

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const signInWithGoogleWorkspace = async (): Promise<{ user: User; accessToken: string }> => {
  if (isSigningIn) {
    throw new Error('Sign in already in progress');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain Google Workspace access token.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Workspace Sign-in Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const ensureAccessToken = async (): Promise<string> => {
  if (cachedAccessToken) return cachedAccessToken;
  const result = await signInWithGoogleWorkspace();
  return result.accessToken;
};

// Helper to construct base64url encoded RFC 2822 email for Gmail API
function encodeEmailRaw(to: string, cc: string, bcc: string, subject: string, body: string): string {
  const headers = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    bcc ? `Bcc: ${bcc}` : null,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body,
  ].filter((line) => line !== null);

  const emailStr = headers.join('\r\n');
  return btoa(unescape(encodeURIComponent(emailStr)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Direct Gmail API Send
 */
export async function sendDirectEmailViaGmail(params: {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}): Promise<{ id: string; threadId: string }> {
  const token = await ensureAccessToken();
  const raw = encodeEmailRaw(params.to, params.cc || '', params.bcc || '', params.subject, params.body);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gmail API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Direct Google Calendar API Event Create
 */
export async function createDirectCalendarEvent(params: {
  summary: string;
  description?: string;
  startIso: string;
  endIso: string;
  attendees?: string[];
  createMeet?: boolean;
}): Promise<{ id: string; htmlLink: string; hangoutsLink?: string }> {
  const token = await ensureAccessToken();

  const eventPayload: any = {
    summary: params.summary,
    description: params.description || '',
    start: { dateTime: params.startIso },
    end: { dateTime: params.endIso },
    attendees: (params.attendees || []).map((email) => ({ email })),
  };

  if (params.createMeet !== false) {
    eventPayload.conferenceData = {
      createRequest: {
        requestId: `sj_os_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Calendar API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Direct Google Drive API File List
 */
export async function listDirectDriveFiles(): Promise<any[]> {
  const token = await ensureAccessToken();
  const response = await fetch(
    'https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,webViewLink,iconLink)',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Drive API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Direct Google Sheets API Append Row
 */
export async function appendDirectSheetRow(
  spreadsheetId: string,
  range: string,
  values: any[]
): Promise<any> {
  const token = await ensureAccessToken();
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [values] }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Sheets API error: ${response.statusText}`);
  }

  return response.json();
}
