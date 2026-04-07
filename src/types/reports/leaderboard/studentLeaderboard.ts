export interface StudentRanking { 
  userId: string;
  name: string;
  present: number;
  totalWorkingDays: number;
  attendancePercentage: number;
  rank: number;
}

export interface ClassLeaderboardResponse {
  periodType: "MONTH" | "RANGE";
  period: string;
  scope: "CLASS";
  classId: string;
  ranking: StudentRanking[];
}