import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type ApiEndpoint = {
    method: string
    path: string
}

type ApiGroupProps = {
    title: string
    endpoints: ApiEndpoint[]
}

function ApiGroup({ title, endpoints }: ApiGroupProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
                {endpoints.map((api) => (
                    <div
                        key={`${api.method}-${api.path}`}
                        className="flex items-center justify-between border rounded-md px-3 py-2"
                    >
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{api.method}</Badge>
                            <code className="text-xs">{api.path}</code>
                        </div>

                        <Button size="sm" variant="ghost">
                            Docs
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export default ApiGroup
