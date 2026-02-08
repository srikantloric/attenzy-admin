import useAuth from "@/hooks/useAuth";
import type { GuardProps } from "@/types/auth"
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";


function AuthGuard({ children }: GuardProps) {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login', {
                state: {
                    from: location.pathname
                },
                replace: true
            });
        }
    }, [isLoggedIn, navigate, location]);
    return children
}

export default AuthGuard