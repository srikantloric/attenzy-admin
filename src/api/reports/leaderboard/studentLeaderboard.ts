import axios from "axios";
import type { ClassLeaderboardResponse } from "@/types/reports/leaderboard/studentLeaderboard";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const getClassLeaderboard = async ({
  orgId,
  periodType,
  month,
  week,
  startMonth,
  endMonth,
  classId,
}: {
  orgId: string;
  periodType: "MONTH" | "WEEK" | "RANGE";
  month?: string;
  week?: string;
  startMonth?: string;
  endMonth?: string;
  classId: string;
}): Promise<ClassLeaderboardResponse> => {

  const response = await axios.get(
    `${BACKEND_BASE_URL}/orgs/${orgId}/rank-students`,
    {
      params: {
        periodType,
        ...(periodType === "MONTH" && { month }),
        ...(periodType === "WEEK" && { week }),
        ...(periodType === "RANGE" && { startMonth, endMonth }),
        classId,
      },
    }
  );

  return response.data;
};