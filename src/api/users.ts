import type { UserFormValues } from "@/schemas/user.schema";
import type { AssignRFIDResponse, UpdateUserPayload } from "@/types/users";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;


export async function getUsersByOrg(orgId: string) {
  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/users`
  );

  if (!res.ok) throw new Error("Failed to fetch users");

  const data = await res.json();
  data.items.sort((a: any, b: any) => b.createdAt - a.createdAt);
  return data.items;
}


export async function createUser(
  orgId: string,
  payload: UserFormValues
) {

  console.log("Creating user with payload:", payload);
  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/users`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Failed to create user");
  }

  return res.json();
}

export async function getSignedUploadUrl(
  fileName: string,
  contentType: string,
  fileSize: number
) {
  const res = await fetch(
    "https://de2bhobqpg.execute-api.ap-south-1.amazonaws.com/v1/uploads/getS3Url",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        contentType,
        fileSize,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to get signed URL");
  }

  return res.json();
}


export async function updateUser(
  orgId: string,
  userId: string,
  payload: Partial<Omit<UpdateUserPayload, "userId" | "orgId">>
) {
  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/users/${userId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Failed to update user");
  }

  return res.json();
}


export async function assignOrUpdateRFID(
  orgId: string,
  userId: string,
  rfidCode: string
): Promise<AssignRFIDResponse> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/users/${userId}/rfid`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rfidCode }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      error?.message || "Failed to assign RFID"
    );
  }

  return res.json();
}
