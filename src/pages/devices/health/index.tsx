import useAuth from "@/hooks/useAuth";
import PartnerDeviceHealth from "./PartnerDeviceHealth";
import OrgDeviceHealth from "./OrgDeviceHealth";

function DeviceHealth() {
    const { user } = useAuth();

    console.log(user?.role)

    switch (user?.role) {
        case 'PLATFORM_ADMIN':
            return <PartnerDeviceHealth />;
        case 'CHANNEL_PARTNER':
            return <PartnerDeviceHealth />;
        case 'ORGANIZATION':
            return <OrgDeviceHealth />;

        default:
            return null;
    }
}

export default DeviceHealth