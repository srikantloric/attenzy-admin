interface Props {
    status: "PENDING" | "VERIFIED" | "FAILED"
}

export default function WebhookStatusBadge({ status }: Props) {
    const map = {
        PENDING: "bg-yellow-100 text-yellow-800",
        VERIFIED: "bg-green-100 text-green-800",
        FAILED: "bg-red-100 text-red-800"
    }

    return (
        <span
            className={`text-xs px-2 py-1 rounded ${map[status]}`}
        >
            {status}
        </span>
    )
}
