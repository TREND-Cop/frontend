import { Platform } from 'react-native';
import { initializeApp, getApps, getApp, FirebaseApp } from '@firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  Auth,
} from '@firebase/auth';
import { trendApi } from './trendApi';

export const FIREBASE_CONFIG = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyDX9Vf-G2ZLSdJN7h5-2wKPpOfSD9MYHA8',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'trend-beauty-27235.firebaseapp.com',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'trend-beauty-27235',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'trend-beauty-27235.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1033377356806',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    '1:1033377356806:web:ede87888ddc05a08833787',
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-ZPGGL9Z5D1',
};

const REDIRECT_ROLE_KEY = '@trend_google_redirect_role';

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

function getFirebaseAuth(): Auth {
  if (!cachedApp) {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
  }
  if (!cachedAuth) {
    cachedAuth = getAuth(cachedApp);
  }
  return cachedAuth;
}

export interface GoogleAuthResult {
  ok: boolean;
  cancelled?: boolean;
  redirecting?: boolean;
  created?: boolean;
  token?: string;
  user?: {
    id?: string;
    role?: string;
    name?: string;
    email?: string;
    image?: string;
  };
  error?: string;
}

async function exchangeFirebaseIdToken(
  idToken: string,
  role: 'client' | 'business' = 'client'
): Promise<GoogleAuthResult> {
  const res = await trendApi.auth.google({ id_token: idToken, role });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error || 'Google sign-in failed on server.',
    };
  }
  return {
    ok: true,
    created: Boolean(res.data?.created),
    token: res.data?.token,
    user: res.data?.user,
  };
}

/**
 * Completes a web signInWithRedirect flow if one was initiated due to popup blocking.
 */
export async function consumeGoogleRedirectResult(
  defaultRole: 'client' | 'business' = 'client'
): Promise<GoogleAuthResult | null> {
  if (Platform.OS !== 'web') return null;
  try {
    const auth = getFirebaseAuth();
    const result = await getRedirectResult(auth);
    if (!result?.user) return null;
    let role = defaultRole;
    try {
      const savedRole = window.sessionStorage?.getItem(REDIRECT_ROLE_KEY);
      if (savedRole === 'client' || savedRole === 'business') {
        role = savedRole;
      }
      window.sessionStorage?.removeItem(REDIRECT_ROLE_KEY);
    } catch {}
    const idToken = await result.user.getIdToken();
    return exchangeFirebaseIdToken(idToken, role);
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Google sign-in redirect failed.',
    };
  }
}

/**
 * Signs in or registers a Customer with Google via Firebase Auth -> POST /api/auth/google.
 */
export async function signInWithGoogle(
  role: 'client' | 'business' = 'client'
): Promise<GoogleAuthResult> {
  const auth = getFirebaseAuth();

  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();
      return exchangeFirebaseIdToken(idToken, role);
    } catch (err: any) {
      const code = String(err?.code || '');
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        return { ok: false, cancelled: true };
      }
      if (code === 'auth/popup-blocked') {
        try {
          window.sessionStorage?.setItem(REDIRECT_ROLE_KEY, role);
        } catch {}
        await signInWithRedirect(auth, provider);
        return { ok: false, redirecting: true };
      }
      return {
        ok: false,
        error: err?.message || 'Unable to sign in with Google right now.',
      };
    }
  }

  // Native iOS / Android: use @react-native-google-signin/google-signin if linked in binary
  try {
    const pkgName = '@react-native-google-signin/google-signin';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const gsi = (globalThis as any).__trendGoogleSignin || null;
    if (gsi?.GoogleSignin) {
      const result = await gsi.GoogleSignin.signIn();
      const googleIdToken = result?.data?.idToken || result?.idToken;
      if (!googleIdToken) {
        return { ok: false, cancelled: true };
      }
      const credential = GoogleAuthProvider.credential(googleIdToken);
      const userCred = await signInWithCredential(auth, credential);
      const firebaseIdToken = await userCred.user.getIdToken();
      return exchangeFirebaseIdToken(firebaseIdToken, role);
    }
    void pkgName;
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Google Sign-In failed on device.',
    };
  }

  return {
    ok: false,
    error:
      'Google Sign-In works directly on the Web App. For mobile APK/iOS builds, please sign in with phone/password until the native Google Sign-In module is added to the EAS build.',
  };
}
