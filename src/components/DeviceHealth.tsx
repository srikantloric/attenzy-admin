
import type { Device } from "@/types/device"

import { Badge } from "./ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

type DeviceHealthProps = {
    devices: Device[]
    loading?: boolean
}

export default function DeviceHealth({ devices, loading = false }: DeviceHealthProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Device Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {loading ? (
                    <div className="py-2 text-sm text-muted-foreground">Loading device health...</div>
                ) : devices.length === 0 ? (
                    <div className="py-2 text-sm text-muted-foreground">No devices available yet.</div>
                ) : (
                    devices.slice(0, 4).map((device) => (
                        <HealthRow key={device.deviceId} name={device.location || device.deviceId} status={device.status} />
                    ))
                )}
            </CardContent>
        </Card>
    )
}

function HealthRow({ name, status }: { name: string; status: Device["status"] }) {
    const isHealthy = status === "ONLINE" || status === "IDLE"

    return (
        <div className="flex items-center justify-between gap-3">
            <span className="truncate">{name}</span>
            <Badge variant={isHealthy ? "secondary" : "destructive"}>{status.toLowerCase()}</Badge>
        </div>
    )
}
