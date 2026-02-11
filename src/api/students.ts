import type { CreateStudentPayload, Student, UpdateStudentPayload } from "@/types/student";

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


export async function createStudent(
  orgId: string,
  payload: CreateStudentPayload
): Promise<Student> {
  const res = await fetch(`${BACKEND_BASE_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      orgId,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Failed to create student");
  }

  return res.json();
}

export async function updateStudent(
  payload: {
    studentId: string;
    orgId: string;
  } & Partial<Omit<Student, "studentId" | "orgId">>
): Promise<Student> {
  const res = await fetch(`${BACKEND_BASE_URL}/students`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Failed to update student");
  }

  return res.json();
}
