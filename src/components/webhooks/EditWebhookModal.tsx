import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

import { updateWebhook } from "@/api/webhook"
import { WEBHOOK_EVENTS } from "@/constants/webhookEvents"
import type { Webhook, WebhookEvent } from "@/types/webhook"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    webhook: Webhook | null
    onUpdated: () => void
}

export default function EditWebhookModal({
    open,
    onOpenChange,
    webhook,
    onUpdated
}: Props) {
    const [url, setUrl] = useState("")
    const [selectedEvents, setSelectedEvents] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const [urlError, setUrlError] = useState<string | null>(null)
    const [apiError, setApiError] = useState<string | null>(null)

    /* -------------------- Helpers -------------------- */

    const isValidUrl = (value: string) => {
        try {
            const parsed = new URL(value)
            return parsed.protocol === "http:" || parsed.protocol === "https:"
        } catch {
            return false
        }
    }

    const toggleEvent = (event: WebhookEvent) => {
        setSelectedEvents((prev) =>
            prev.includes(event)
                ? prev.filter((e) => e !== event)
                : [...prev, event]
        )
    }

    /* -------------------- Sync webhook → state -------------------- */

    useEffect(() => {
        if (webhook && open) {
            setUrl(webhook.url)
            setSelectedEvents(webhook.events)
            setUrlError(null)
            setApiError(null)
            setLoading(false)
        }
    }, [webhook, open])

    if (!webhook) return null

    /* -------------------- Actions -------------------- */

    const handleUpdate = async () => {
        setApiError(null)

        if (!isValidUrl(url)) {
            setUrlError("Please enter a valid URL (http or https)")
            return
        }

        if (selectedEvents.length === 0) {
            setApiError("Please select at least one event")
            return
        }

        try {
            setLoading(true)

            await updateWebhook({
                webhookId: webhook.webhookId,
                url,
                events: selectedEvents
            })

            onOpenChange(false)
            onUpdated()
        } catch (err: any) {
            setApiError(
                err?.message || "Failed to update webhook. Please try again."
            )
        } finally {
            setLoading(false)
        }
    }

    /* -------------------- UI -------------------- */

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Webhook</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* URL */}
                    <div className="space-y-1">
                        <Input
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value)
                                setUrlError(null)
                            }}
                        />
                        {urlError && (
                            <p className="text-xs text-destructive">{urlError}</p>
                        )}
                    </div>

                    {/* Events */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Events</p>

                        <div className="space-y-2">
                            {WEBHOOK_EVENTS.map((event) => (
                                <div
                                    key={event.value}
                                    className="flex items-center gap-2"
                                >
                                    <Checkbox
                                        id={event.value}
                                        checked={selectedEvents.includes(event.value)}
                                        onCheckedChange={() => toggleEvent(event.value)}
                                    />
                                    <label
                                        htmlFor={event.value}
                                        className="text-sm cursor-pointer"
                                    >
                                        {event.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* API Error */}
                    {apiError && (
                        <p className="text-sm text-destructive">{apiError}</p>
                    )}

                    <Button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full bg-primary"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
