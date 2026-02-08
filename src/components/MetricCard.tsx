import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function MetricCard({ title, value }: { title: string; value: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{value}</p>
            </CardContent>
        </Card>
    )
}

export default MetricCard
