import type { ReactElement } from 'react';
// third-party
import firebase from 'firebase/compat/app';
// ==============================|| TYPES - AUTH  ||============================== //

export type GuardProps = {
    children: ReactElement | null;
};

type UserProfile = {
    id?: string;
    email?: string;
    avatar?: string;
    image?: string;
    name?: string;
    role?: string;
    tier?: string;
};

export interface AuthProps {
    isLoggedIn: boolean;
    isInitialized?: boolean;
    user?: UserProfile | null;
    token?: string | null;
}

export interface AuthActionProps {
    type: string;
    payload?: AuthProps;
}

export type FirebaseContextType = {
    isLoggedIn: boolean;
    isInitialized?: boolean;
    user?: UserProfile | null | undefined;
    db: firebase.firestore.Firestore;
    logout: () => Promise<void>;
    login: () => void;
    firebaseRegister: (email: string, password: string) => Promise<firebase.auth.UserCredential>;
    firebaseEmailPasswordSignIn: (email: string, password: string) => Promise<firebase.auth.UserCredential>;
    resetPassword: (email: string) => Promise<void>;
    updateProfile: VoidFunction;
};
