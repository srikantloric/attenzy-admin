import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

import { testWebhook } from "@/api/webhook"
import { toast } from "sonner"
import {  TriangleAlert } from "lucide-react"

interface Props {
    open: boolean
    onOpenChange: (v: boolean) => void
    webhookId: string
}

export default function TestWebhookModal({
    open,
    onOpenChange,
    webhookId
}: Props) {
    const [orgId, setOrgId] = useState("ATT-O-TEST")
    const [deviceId, setDeviceId] = useState("ATTENZY-TEST")
    const [eventType, setEventType] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>("")

    const EVENTS = ["RFID_SCAN", "DEVICE_ONLINE", "DEVICE_OFFLINE"]

    const handleTest = async () => {
        setError("")
        try {
            setLoading(true)
            await testWebhook(webhookId, { orgId, deviceId, eventType })
            toast.success("Test event sent successfully")
            onOpenChange(false)
        } catch (err: any) {
            const message = err?.message || "Failed to send test event"
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Test Webhook</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Org ID */}
                    <Input
                        placeholder="Organization ID"
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                    />

                    {/* Device ID */}
                    <Input
                        placeholder="Device ID"
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                    />

                    {/* Event Type */}
                    <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                            {EVENTS.map((e) => (
                                <SelectItem key={e} value={e}>
                                    {e}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {error && (
                        <div className="border border-red-400 rounded-md px-2 py-2 flex items-center gap-2 ">
                            <TriangleAlert className="text-red-500" />
                            <p className="text-sm text-red-600">
                                Error :  {error}
                            </p>
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        onClick={handleTest}
                        disabled={!orgId || !deviceId || !eventType || loading}
                        className="w-full bg-primary"
                    >
                        {loading ? "Sending..." : "Send Test Event"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
