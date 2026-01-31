import { Card, CardContent } from "./ui/card";

export default function StatCard({
    title,
    value,
    trend,
    icon,
    negative,
    warning,
}: any) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between px-4 ">
                {/* Left */}
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{title}</p>
                    <p className="text-xl font-semibold leading-none">{value}</p>
                    <p
                        className={`text-xs ${negative
                            ? "text-red-500"
                            : warning
                                ? "text-amber-500"
                                : "text-primary"
                            }`}
                    >
                        {trend}
                    </p>
                </div>

                {/* Right Icon */}
                <div className="text-primary [&_svg]:h-6 [&_svg]:w-6">
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}
