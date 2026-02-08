type TopEndpointProps = {
    path: string
    count: string | number
}

function TopEndpoint({ path, count }: TopEndpointProps) {
    return (
        <div className="flex items-center justify-between border rounded-md px-3 py-2">
            <code className="text-xs text-muted-foreground">{path}</code>
            <span className="text-xs font-medium">{count}</span>
        </div>
    )
}

export default TopEndpoint
