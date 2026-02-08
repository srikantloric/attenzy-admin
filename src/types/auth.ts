import type { ReactElement } from 'react';
// third-party
import type { Role } from './role';
// ==============================|| TYPES - AUTH  ||============================== //

export type GuardProps = {
    children: ReactElement | null;
};

type UserProfile = {
    /** Auth identity (Cognito sub) */
    userId: string;

    /** Business context */
    partnerId?: string;
    orgId?: string;

    /** Display info */
    email?: string;
    name?: string;
    avatar?: string;
    image?: string;

    /** Authorization */
    role?: Role;   
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

export type AWSCognitoContextType = {
    isLoggedIn: boolean;
    isInitialized?: boolean;
    user?: UserProfile | null | undefined;
    logout: () => void;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<unknown>;
    resetPassword: (verificationCode: string, newPassword: string) => Promise<any>;
    forgotPassword: (email: string) => Promise<void>;
    updateProfile: VoidFunction;
    codeVerification: (verificationCode: string) => Promise<any>;
    resendConfirmationCode: () => Promise<any>;
};


export interface InitialLoginContextProps {
    isLoggedIn: boolean;
    isInitialized?: boolean;
    user?: UserProfile | null | undefined;
}
