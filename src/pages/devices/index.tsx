import useAuth from "@/hooks/useAuth";
import PartnerDevice from "./partner";
import OrganizationDevice from "./organization";

function DevicePage() {
    const { user } = useAuth();

    console.log(user?.role)

    switch (user?.role) {
        case 'PLATFORM_ADMIN':
            return <PartnerDevice />;
        case 'CHANNEL_PARTNER':
            return <PartnerDevice />;

        case 'ORGANIZATION':
            return <OrganizationDevice />;

        default:
            return null;
    }
}

export default DevicePage