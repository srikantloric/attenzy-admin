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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

import { WEBHOOK_EVENTS } from "@/constants/webhookEvents"
import { createWebhook } from "@/api/webhook"
import type {
    WebhookEvent,
    WebhookAuthType,
    WebhookAuth
} from "@/types/webhook"

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
    /* -------------------- State -------------------- */

    const [url, setUrl] = useState("")
    const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([])
    const [loading, setLoading] = useState(false)

    const [authType, setAuthType] = useState<WebhookAuthType>("NONE")
    const [apiKeyHeader, setApiKeyHeader] = useState("x-api-key")
    const [apiKeyValue, setApiKeyValue] = useState("")
    const [bearerToken, setBearerToken] = useState("")
    const [hmacSecret, setHmacSecret] = useState("")

    const [urlError, setUrlError] = useState<string | null>(null)
    const [apiError, setApiError] = useState<string | null>(null)

    // 🔐 one-time secret
    const [createdSecret, setCreatedSecret] = useState<string | null>(null)
    const [showSecretModal, setShowSecretModal] = useState(false)

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

    /* -------------------- Reset on Close -------------------- */

    useEffect(() => {
        if (!open) {
            setUrl("")
            setSelectedEvents([])
            setAuthType("NONE")
            setApiKeyHeader("x-api-key")
            setApiKeyValue("")
            setBearerToken("")
            setHmacSecret("")
            setUrlError(null)
            setApiError(null)
            setLoading(false)
        }
    }, [open])

    /* -------------------- Create Webhook -------------------- */

    const handleCreate = async () => {
        setApiError(null)

        if (!isValidUrl(url)) {
            setUrlError("Please enter a valid URL (http:// or https://)")
            return
        }

        if (selectedEvents.length === 0) {
            setApiError("Please select at least one event")
            return
        }

        try {
            setLoading(true)

            let auth: WebhookAuth | undefined

            switch (authType) {
                case "NONE":
                    auth = { type: "NONE" }
                    break

                case "API_KEY":
                    auth = {
                        type: "API_KEY",
                        headerName: apiKeyHeader,
                        token: apiKeyValue
                    }
                    break

                case "BEARER":
                    auth = {
                        type: "BEARER",
                        token: bearerToken
                    }
                    break

                case "HMAC":
                    auth = {
                        type: "HMAC",
                        secret: hmacSecret
                    }
                    break
            }

            const res = await createWebhook({
                url,
                events: selectedEvents,
                ownerType,
                ownerId,
                auth
            })
            

            // 🔐 capture secret ONCE
            if (res.secret) {
                setCreatedSecret(res.secret)
                setShowSecretModal(true)
            }

            onOpenChange(false)
            onCreated()
        } catch (err: any) {
            setApiError(err?.message || "Failed to create webhook")
        } finally {
            setLoading(false)
        }
    }

    /* -------------------- UI -------------------- */

    return (
        <>
            {/* CREATE MODAL */}
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
                            {WEBHOOK_EVENTS.map((event) => (
                                <div key={event.value} className="flex items-center gap-2">
                                    <Checkbox
                                        id={event.value}
                                        checked={selectedEvents.includes(event.value)}
                                        onCheckedChange={() => toggleEvent(event.value)}
                                    />
                                    <label htmlFor={event.value} className="text-sm cursor-pointer">
                                        {event.label}
                                    </label>
                                </div>
                            ))}
                        </div>

                        {/* Auth Type */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Authentication</p>
                            <Select
                                value={authType}
                                onValueChange={(v) =>
                                    setAuthType(v as WebhookAuthType)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select auth type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NONE">None</SelectItem>
                                    <SelectItem value="API_KEY">API Key</SelectItem>
                                    <SelectItem value="BEARER">Bearer Token</SelectItem>
                                    <SelectItem value="HMAC">HMAC Signature</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Auth Fields */}
                        {authType === "API_KEY" && (
                            <>
                                <Input
                                    placeholder="Header name (e.g. x-api-key)"
                                    value={apiKeyHeader}
                                    onChange={(e) => setApiKeyHeader(e.target.value)}
                                />
                                <Input
                                    placeholder="API key value"
                                    value={apiKeyValue}
                                    onChange={(e) => setApiKeyValue(e.target.value)}
                                />
                            </>
                        )}

                        {authType === "BEARER" && (
                            <Input
                                placeholder="Bearer token"
                                value={bearerToken}
                                onChange={(e) => setBearerToken(e.target.value)}
                            />
                        )}

                        {authType === "HMAC" && (
                            <Input
                                placeholder="Signing secret (optional)"
                                value={hmacSecret}
                                onChange={(e) => setHmacSecret(e.target.value)}
                            />
                        )}

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

            {/* 🔐 ONE-TIME SECRET MODAL */}
            <Dialog open={showSecretModal} onOpenChange={setShowSecretModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Webhook Secret</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This secret is shown <strong>only once</strong>.
                            Copy and store it securely.
                        </p>

                        <div className="relative">
                            <Input
                                readOnly
                                value={createdSecret ?? ""}
                                className="pr-20 font-mono"
                            />
                            <Button
                                size="sm"
                                variant="secondary"
                                className="absolute right-1 top-1"
                                onClick={() =>
                                    navigator.clipboard.writeText(createdSecret ?? "")
                                }
                            >
                                Copy
                            </Button>
                        </div>

                        <div className="rounded-md border border-warning bg-warning/10 p-3 text-sm">
                            ⚠️ You will not be able to view this secret again.
                            If lost, rotate the webhook secret.
                        </div>

                        <Button
                            className="w-full"
                            onClick={() => {
                                setShowSecretModal(false)
                                setCreatedSecret(null)
                            }}
                        >
                            I have saved the secret
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
