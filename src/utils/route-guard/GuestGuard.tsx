import type { GuardProps } from "@/types/auth"
import useAuth from '@/hooks/useAuth';
import { useEffect } from 'react';
import { APP_DEFAULT_PATH } from '@/config';
import { useLocation, useNavigate } from "react-router-dom";

function GuestGuard({ children }: GuardProps) {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (isLoggedIn) {
            navigate(location?.state?.from ? location?.state?.from : APP_DEFAULT_PATH, {
                state: { from: '' },
                replace: true
            });
        }
    }, [isLoggedIn, navigate, location])
    return children
}

export default GuestGuard