import axios from "axios";
import type { ClassLeaderboardResponse } from "@/types/reports/leaderboard/classLeaderboard";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

export const getClassLeaderboard = async ({
  orgId,
  periodType,
  month,
  classId,
}: {
  orgId: string;
  periodType: "MONTH" | "RANGE";
  month: string;
  classId: string;
}): Promise<ClassLeaderboardResponse> => {
  const response = await axios.get(
    `${BACKEND_BASE_URL}/orgs/${orgId}/rank-students`,
    {
      params: {
        periodType,
        month,
        classId,
      },
    }
  );

  return response.data;
};