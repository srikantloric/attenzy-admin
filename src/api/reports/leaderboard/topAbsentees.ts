import type { TopAbsenteesResponse } from "@/types/reports/leaderboard/topAbsentees"

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

// 🔹 Monthly / Weekly / Range (Single API with dynamic params)
export async function getTopAbsentees(
  orgId: string,
  periodType: "MONTH" | "WEEK" | "RANGE",
  options?: {
    month?: string
    week?: string
    startMonth?: string
    endMonth?: string
  }
): Promise<TopAbsenteesResponse> {

  const params = new URLSearchParams({
    periodType,
  })

  // ✅ Add params based on type
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

  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/top-absentees?${params.toString()}`
  )

  if (!res.ok) {
    throw new Error("Failed to fetch top absentees")
  }

  return res.json()
}