import type { Device } from "@/types/device"

export const rssiToBars = (rssi?: number): number => {
    if (rssi == null) return 0
    if (rssi >= -55) return 4
    if (rssi >= -65) return 3
    if (rssi >= -75) return 2
    if (rssi >= -85) return 1
    return 0
}

export const mapStatusToUi = (
    status: Device["status"]
): "ONLINE" | "IDLE" | "OFFLINE" => {
    switch (status) {
        case "ONLINE":
            return "ONLINE"

        case "IDLE":
        case "SYNCHRONIZING":
            return "IDLE"

        case "OFFLINE":
        case "INACTIVE":
        case "MAINTENANCE":
        case "DECOMMISSIONED":
        default:
            return "OFFLINE"
    }
}

export const formatLastActivity = (timestamp?: number) => {
    if (!timestamp) return "—"

    const now = Date.now()
    const diffMs = now - timestamp
    if (diffMs < 0) return "—"

    const seconds = Math.floor(diffMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 5) return "just now"
    if (seconds < 60) return `${seconds} second${seconds > 1 ? "s" : ""} ago`
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    if (days === 1) return "1 day ago"
    if (days < 7) return `${days} days ago`

    return new Date(timestamp).toDateString()
}

export const formatUptime = (uptimeSeconds: number): string => {
    if (!uptimeSeconds || uptimeSeconds <= 0) return "—"

    const days = Math.floor(uptimeSeconds / 86400)
    const hours = Math.floor((uptimeSeconds % 86400) / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)
    const seconds = Math.floor(uptimeSeconds % 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
}