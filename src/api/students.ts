import type { Student } from "@/types/student";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export async function getStudentsByOrg(
  orgId: string
): Promise<Student[]> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/students?orgId=${orgId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch students");
  }

  const data = await res.json();
  return data.items;
}
