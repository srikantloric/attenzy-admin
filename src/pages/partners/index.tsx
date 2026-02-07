import useAuth from "@/hooks/useAuth";
import OrgPartnersPage from "./OrgPartnersPage.";
import PartnerSelfPage from "./PartnerSelfPage";
import PlatformPartnersPage from "./PlatformPartnersPage";

export const PartnersPage = () => {
    const { user } = useAuth();

    switch (user?.role) {
        case 'PLATFORM_ADMIN':
            return <PlatformPartnersPage />;
        case 'CHANNEL_PARTNER':
            return <PartnerSelfPage />;
        case 'ORGANIZATION':
            return <OrgPartnersPage />;
        default:
            return null;
    }
}