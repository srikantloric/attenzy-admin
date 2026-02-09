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

import { WEBHOOK_EVENTS } from "@/constants/webhookEvents"
import { createWebhook } from "@/api/webhook"
import type { WebhookEvent } from "@/types/webhook"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    ownerType: "CHANNEL_PARTNER" | "PLATFORM_ADMIN"
    ownerId: string
    onCreated: () => void
}

export default function AddWebhookModal({
    open,
    onOpenChange,
    ownerType,
    ownerId,
    onCreated
}: Props) {
    const [url, setUrl] = useState("")
    const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([])
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

    /* -------------------- Effects -------------------- */

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setUrl("")
            setSelectedEvents([])
            setUrlError(null)
            setApiError(null)
            setLoading(false)
        }
    }, [open])

    /* -------------------- Actions -------------------- */

    const handleCreate = async () => {
        setApiError(null)

        if (!isValidUrl(url)) {
            setUrlError("Please enter a valid URL (must start with http:// or https://)")
            return
        }

        if (selectedEvents.length === 0) {
            setApiError("Please select at least one event")
            return
        }

        try {
            setLoading(true)

            const res = await createWebhook({
                url,
                events: selectedEvents,
                ownerType,
                ownerId
            })

            console.log("Webhook Created:",res)

            onOpenChange(false)
            onCreated()
        } catch (err: any) {
            setApiError(
                err?.message || "Failed to create webhook. Please try again."
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
                    <DialogTitle>Add Webhook</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* URL */}
                    <div className="space-y-1">
                        <Input
                            placeholder="https://example.com/webhook"
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
                        onClick={handleCreate}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Creating..." : "Create Webhook"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
