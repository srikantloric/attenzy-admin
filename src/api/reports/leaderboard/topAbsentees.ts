import type { TopAbsenteesResponse } from "@/types/reports/leaderboard/topAbsentees"
import axiosServices from "@/utils/axios"


export async function getTopAbsentees(
    orgId: string,
    periodType: "MONTH" | "WEEK" | "RANGE",
    options?: {
        month?: string
        week?: string
        startMonth?: string
        endMonth?: string
        classId?: string
    }
): Promise<TopAbsenteesResponse> {

    const params = new URLSearchParams({
        periodType,
    })



    if (periodType === "MONTH" && options?.month) {
        params.append("month", options.month)
    }

    if (periodType === "WEEK" && options?.week) {
        params.append("week", options.week)
    }

    if (periodType === "RANGE") {
        if (options?.startMonth) params.append("startMonth", options.startMonth)
        if (options?.endMonth) params.append("endMonth", options.endMonth)
    }

    const res = await axiosServices.get(
        `/orgs/${orgId}/top-absentees?${params.toString()}`
    )
    return res.data
}