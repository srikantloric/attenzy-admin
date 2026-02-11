import type {
  Staff,
  CreateStaffPayload,
  UpdateStaffPayload,
} from "@/types/staff";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

/* ================= GET BY ORG ================= */

export async function getStaffByOrg(
  orgId: string
): Promise<Staff[]> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/staff?orgId=${orgId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch staff");
  }

  const data = await res.json();
  return data.items;
}

/* ================= CREATE ================= */

export async function createStaff(
  orgId: string,
  payload: CreateStaffPayload
): Promise<Staff> {
  const res = await fetch(`${BACKEND_BASE_URL}/staff`, {
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
    throw new Error(error?.message || "Failed to create staff");
  }

  return res.json();
}

/* ================= UPDATE ================= */

export async function updateStaff(
  payload: UpdateStaffPayload
): Promise<Staff> {
  const res = await fetch(`${BACKEND_BASE_URL}/staff`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Failed to update staff");
  }

  return res.json();
}
