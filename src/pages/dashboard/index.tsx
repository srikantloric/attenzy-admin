import useAuth from "@/hooks/useAuth";
import PlatformDashboard from "./platform";
import PartnerDashboard from "./partner";
import OrganizationDashboard from "./organization";


export default function DashboardPage() {

    const { user } = useAuth();

    switch (user?.role) {
        case 'PLATFORM_ADMIN':
            return <PlatformDashboard />;
        case 'CHANNEL_PARTNER':
            return <PartnerDashboard />;

        case 'ORGANIZATION':
            return <OrganizationDashboard />;

        default:
            return null;
    }
}

