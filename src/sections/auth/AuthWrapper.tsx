import type { ReactElement } from "react";

interface Props {
    children: ReactElement;
}

function AuthWrapper({ children }: Props) {
    return (
        <div>{children}</div>
    )
}

export default AuthWrapper