import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type WebhookRowProps = {
    url: string
    events: string[]
    status?: "Active" | "Disabled"
    lastDelivery?: string
    onEdit?: () => void
    onDelete?: () => void
    onTest?: () => void
}

function WebhookRow({
    url,
    events,
    status = "Active",
    lastDelivery = "Just now",
    onEdit,
    onDelete,
    onTest,
}: WebhookRowProps) {
    return (
        <div className="border rounded-md p-4 space-y-3">
            {/* URL + status */}
            <div className="flex items-center justify-between gap-2">
                <Input value={url} readOnly />

                <Badge variant={status === "Active" ? "secondary" : "destructive"}>
                    {status}
                </Badge>
            </div>

            {/* Events */}
            <div className="flex flex-wrap gap-2">
                {events.map((event) => (
                    <Badge key={event} variant="outline">
                        {event}
                    </Badge>
                ))}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    Last delivery: {lastDelivery}
                </p>

                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={onTest}>
                        Test
                    </Button>
                    <Button size="sm" variant="outline" onClick={onEdit}>
                        Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={onDelete}>
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default WebhookRow
