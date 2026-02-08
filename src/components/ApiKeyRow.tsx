import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type ApiKeyRowProps = {
    name: string
    keyValue: string
    status: "Active" | "Revoked"
    onRotate?: () => void
    onRevoke?: () => void
}

function ApiKeyRow({
    name,
    keyValue,
    status,
    onRotate,
    onRevoke,
}: ApiKeyRowProps) {
    return (
        <div className="flex items-center justify-between border rounded-md px-4 py-3">
            <div>
                <p className="font-medium">{name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-60">
                    {keyValue}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Badge variant={status === "Active" ? "secondary" : "destructive"}>
                    {status}
                </Badge>

                <Button
                    size="sm"
                    variant="outline"
                    disabled={status !== "Active"}
                    onClick={onRotate}
                >
                    Rotate
                </Button>

                <Button
                    size="sm"
                    variant="destructive"
                    disabled={status !== "Active"}
                    onClick={onRevoke}
                >
                    Revoke
                </Button>
            </div>
        </div>
    )
}

export default ApiKeyRow
