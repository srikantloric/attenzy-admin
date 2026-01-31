
import { Badge } from "./ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export default function DeviceHealth() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Device Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <HealthRow name="Main Gate" status="online" />
                <HealthRow name="Block A" status="online" />
                <HealthRow name="Lab 2" status="offline" />
            </CardContent>
        </Card>
    )
}

function HealthRow({ name, status }: any) {
    return (
        <div className="flex items-center justify-between">
            <span>{name}</span>
            <Badge variant={status === "online" ? "secondary" : "destructive"}>
                {status}
            </Badge>
        </div>
    )
}
