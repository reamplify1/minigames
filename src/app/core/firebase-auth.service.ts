import { Injectable } from '@angular/core';
import type { Auth, User } from 'firebase/auth';
import { firebaseOptions } from './firebase-env.generated';

const GOOGLE_SIGN_IN_TIMEOUT_MS: number = 90 * 1000;

type FirebaseAuthSdk = typeof import('firebase/auth');

interface FirebaseConnection {
  auth: Auth;
  sdk: FirebaseAuthSdk;
}

function rejectAfter(ms: number): Promise<never> {
  return new Promise<never>(
    (_resolve: (value: never) => void, reject: (reason: Error) => void): void => {
      setTimeout((): void => {
        reject(
          Object.assign(new Error('Google sign-in timed out.'), { code: 'auth/popup-timeout' })
        );
      }, ms);
    }
  );
}

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private connection: Promise<FirebaseConnection> | undefined;

  async login(email: string, password: string): Promise<User> {
    const { auth, sdk } = await this.connect();
    const credential = await sdk.signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }

  async register(email: string, password: string, displayName: string): Promise<User> {
    const { auth, sdk } = await this.connect();
    const credential = await sdk.createUserWithEmailAndPassword(auth, email, password);
    await sdk.updateProfile(credential.user, { displayName });
    return credential.user;
  }

  async loginWithGoogle(): Promise<User> {
    const { auth, sdk } = await this.connect();
    const credential = await Promise.race([
      sdk.signInWithPopup(auth, new sdk.GoogleAuthProvider()),
      rejectAfter(GOOGLE_SIGN_IN_TIMEOUT_MS),
    ]);

    return credential.user;
  }

  async logout(): Promise<void> {
    const { auth, sdk } = await this.connect();
    await sdk.signOut(auth);
  }

  private connect(): Promise<FirebaseConnection> {
    this.connection ??= Promise.all([import('firebase/app'), import('firebase/auth')]).then(
      ([app, sdk]: [typeof import('firebase/app'), FirebaseAuthSdk]): FirebaseConnection => ({
        auth: sdk.getAuth(app.initializeApp(firebaseOptions)),
        sdk,
      })
    );

    return this.connection;
  }
}
