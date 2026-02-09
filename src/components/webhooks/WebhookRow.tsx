import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, CheckCircle, RotateCcw, FlaskConical } from "lucide-react"
import { deleteWebhook, updateWebhook, verifyWebhook } from "@/api/webhook"
import type { Webhook } from "@/types/webhook"
import { useState } from "react"
import { toast } from "sonner"
import TestWebhookModal from "./TestWebhookModal"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface Props {
    webhook: Webhook
    onEdit: (webhook: Webhook) => void
    onUpdated: () => void
}

function VerificationBadge({ status }: { status: Webhook["verificationStatus"] }) {
    const map = {
        PENDING: "bg-yellow-100 text-yellow-800",
        VERIFIED: "bg-green-100 text-green-800",
        FAILED: "bg-red-100 text-red-800"
    }

    return (
        <span className={`text-xs px-2 py-0.5 rounded ${map[status]}`}>
            {status}
        </span>
    )
}

export default function WebhookRow({ webhook, onEdit, onUpdated }: Props) {
    const [loading, setLoading] = useState(false)
    const [testOpen, setTestOpen] = useState(false)
    /* ---------------- Toggle Active ---------------- */
    const toggleActive = async (checked: boolean) => {
        if (webhook.verificationStatus !== "VERIFIED") return
        await updateWebhook({
            webhookId: webhook.webhookId,
            isActive: checked
        })
        onUpdated()
    }

    /* ---------------- Verify / Retry ---------------- */
    const handleVerify = async () => {
        try {
            setLoading(true)
            await verifyWebhook(webhook.webhookId)
            toast.success("Verification Successfull!")
            onUpdated()
        } catch (err: any) {
            toast.error(`Verification Failed: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    /* ---------------- Delete ---------------- */
    const handleDelete = async () => {
        await deleteWebhook(webhook.webhookId)
        onUpdated()
    }

    const showVerify =
        webhook.verificationStatus === "PENDING" ||
        webhook.verificationStatus === "FAILED"

    return (
        <div className="flex items-center justify-between border rounded-md p-3">
            {/* Left */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{webhook.url}</p>
                    <VerificationBadge status={webhook.verificationStatus} />
                </div>

                <p className="text-xs text-muted-foreground">
                    Events: {webhook.events.join(", ")}
                </p>

                {webhook.verificationStatus === "FAILED" &&
                    webhook.lastVerificationError && (
                        <p className="text-xs text-red-600">
                            {webhook.lastVerificationError}
                        </p>
                    )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
                {/* Verify / Retry */}
                {showVerify && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleVerify}
                        disabled={loading}
                    >
                        {webhook.verificationStatus === "FAILED" ? (
                            <RotateCcw className="h-4 w-4 mr-1" />
                        ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        {loading ? "Verifying..." : "Verify"}
                    </Button>
                )}

                {/* Active toggle */}
                <Switch
                    checked={webhook.isActive}
                    disabled={webhook.verificationStatus !== "VERIFIED"}
                    onCheckedChange={toggleActive}
                />
                {webhook.isActive && webhook.verificationStatus === "VERIFIED" && (
                    <Tooltip >
                        <TooltipTrigger>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setTestOpen(true)}
                                title="Test Webhook"
                            >
                                <FlaskConical className="h-4 w-4 text-blue-600" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Test Webhook
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Edit */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(webhook)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>

                {/* Delete */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleDelete}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
            <TestWebhookModal
                open={testOpen}
                onOpenChange={setTestOpen}
                webhookId={webhook.webhookId}
            />
        </div>
    )
}
