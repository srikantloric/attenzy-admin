import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { useBreadcrumbs } from "@/hooks/useBreadcrumbs"

export function AppBreadcrumb() {
    const breadcrumbs = useBreadcrumbs()

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((bc, index) => {
                    const isLast = index === breadcrumbs.length - 1

                    return (
                        <BreadcrumbItem key={bc.href}>
                            {isLast ? (
                                <BreadcrumbPage>{bc.label}</BreadcrumbPage>
                            ) : (
                                <>
                                    <BreadcrumbLink href={bc.href}>
                                        {bc.label}
                                    </BreadcrumbLink>
                                    <BreadcrumbSeparator />
                                </>
                            )}
                        </BreadcrumbItem>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
