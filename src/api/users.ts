import type { UserFormValues } from "@/schemas/user.schema";
import type { AssignRFIDResponse, UpdateUserPayload } from "@/types/users";
import type { User } from "@/types/users";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export type GetUsersByOrgParams = {
  userType?: string;
  classId?: string;
  grade?: string;
};


export async function getUsersByOrg(
  orgId: string,
  params?: GetUsersByOrgParams
): Promise<User[]> {
  const query = new URLSearchParams();

  if (params?.userType) query.set("userType", params.userType);
  if (params?.classId) query.set("classId", params.classId);
  if (params?.grade) query.set("grade", params.grade);

  const queryString = query.toString();
  const res = await fetch(
    `${BACKEND_BASE_URL}/orgs/${orgId}/users${queryString ? `?${queryString}` : ""}`
  );

  if (!res.ok) throw new Error("Failed to fetch users");

  const data = (await res.json()) as { items?: User[] };
  const items = Array.isArray(data.items) ? data.items : [];
  items.sort((a, b) => b.createdAt - a.createdAt);
  return items;
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
