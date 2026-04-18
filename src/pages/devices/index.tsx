import useAuth from "@/hooks/useAuth";
import PartnerDevice from "./partnerDevicePage";
import OrganizationDevice from "./organizationDevicePage";
import PlatformDevice from "./platformDevicePage";

function DevicePage() {
    const { user } = useAuth();

    console.log(user?.role)

    switch (user?.role) {
        case 'PLATFORM_ADMIN':
            return <PlatformDevice />;
        case 'CHANNEL_PARTNER':
            return <PartnerDevice />;

        case 'ORGANIZATION':
            return <OrganizationDevice />;

        default:
            return null;
    }
}

export default DevicePage