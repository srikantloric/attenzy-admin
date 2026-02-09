import type { WebhookEvent } from "@/types/webhook"

export const WEBHOOK_EVENTS: {
    label: string
    value: WebhookEvent
}[] = [
        { label: "RFID Scan", value: "RFID_SCAN" },
        { label: "Device Online", value: "DEVICE_ONLINE" },
        { label: "Device Offline", value: "DEVICE_OFFLINE" }
    ]
