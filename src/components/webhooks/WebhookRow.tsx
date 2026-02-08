import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { deleteWebhook, updateWebhook } from "@/api/webhook"
import type { Webhook } from "@/types/webhook"

interface Props {
    webhook: Webhook
    onEdit: (webhook: Webhook) => void
    onUpdated: () => void
}

export default function WebhookRow({ webhook, onEdit, onUpdated }: Props) {
    const toggleActive = async (checked: boolean) => {
        await updateWebhook({
            webhookId: webhook.webhookId,
            isActive: checked
        })
        onUpdated()
    }

    const handleDelete = async () => {
        await deleteWebhook(webhook.webhookId)
        onUpdated()
    }

    return (
        <div className="flex items-center justify-between border rounded-md p-3">
            <div className="space-y-1">
                <p className="text-sm font-medium">{webhook.url}</p>
                <p className="text-xs text-muted-foreground">
                    Events: {webhook.events.join(", ")}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Switch checked={webhook.isActive} onCheckedChange={toggleActive} />

                <Button size="icon" variant="ghost" onClick={() => onEdit(webhook)}>
                    <Pencil className="h-4 w-4" />
                </Button>

                <Button size="icon" variant="ghost" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </div>
    )
}
