import type {
  Faculty,
  CreateFacultyPayload,
} from "@/types/faculty";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

/* ================= GET BY ORG ================= */

export async function getFaculty(
  orgId: string
): Promise<Faculty[]> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/faculty?orgId=${orgId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch faculty");
  }

  const data = await res.json();
  return data.items;
}

/* ================= CREATE ================= */

export async function createFaculty(
  orgId: string,
  payload: CreateFacultyPayload
): Promise<Faculty> {
  const res = await fetch(`${BACKEND_BASE_URL}/faculty`, {
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
    throw new Error(error?.message || "Failed to create faculty");
  }

  return res.json();
}

/* ================= UPDATE ================= */

export async function updateFaculty(
  payload: {
    facultyId: string;
    orgId: string;
  } & Partial<Omit<Faculty, "facultyId" | "orgId">>
): Promise<Faculty> {
  const res = await fetch(`${BACKEND_BASE_URL}/faculty`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Failed to update faculty");
  }

  return res.json();
}
