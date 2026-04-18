import type { UserFormValues } from "@/schemas/user.schema";
import type { AssignRFIDResponse, UpdateUserPayload } from "@/types/users";
import type { User } from "@/types/users";
import axiosServices from "@/utils/axios";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export type GetUsersByOrgParams = {
  userType?: string;
  classId?: string;
  grade?: string;
};

export async function getUsersByOrg(
  orgId: string,
  params?: GetUsersByOrgParams,
): Promise<User[]> {
  const query = new URLSearchParams();

  if (params?.userType) query.set("userType", params.userType);
  if (params?.classId) query.set("classId", params.classId);
  if (params?.grade) query.set("grade", params.grade);

  const queryString = query.toString();
  const res = await axiosServices.get(
    `${BACKEND_BASE_URL}/orgs/${orgId}/users${
      queryString ? `?${queryString}` : ""
    }`,
  );

  const data = (await res.data) as { items?: User[] };
  const items = Array.isArray(data.items) ? data.items : [];
  items.sort((a, b) => b.createdAt - a.createdAt);
  return items;
}

export async function getStudentsByClass(
  orgId: string,
  userType: string,
  className?: string,
  section?: string,
): Promise<User[]> {
  const query = new URLSearchParams();

  query.set("userType", userType);

  if (className && className !== "all") {
    query.set("class", className);
  }

  if (section && section !== "all") {
    query.set("section", section);
  }

  const res = await axiosServices.get(
    `${BACKEND_BASE_URL}/orgs/${orgId}/users?${query.toString()}`,
  );

  const data = (await res.data) as { items?: User[] };
  return data.items ?? [];
}

export async function createUser(orgId: string, payload: UserFormValues) {
  console.log("Creating user with payload:", payload);
  const res = await axiosServices.post(
    `${BACKEND_BASE_URL}/orgs/${orgId}/users`,
    payload,
  );
  return res.data;
}

export async function getSignedUploadUrl(
  fileName: string,
  contentType: string,
  fileSize: number,
) {
  const res = await axiosServices.post(`${BACKEND_BASE_URL}/uploads/getS3Url`, {
    fileName,
    contentType,
    fileSize,
  });

  return res.data as { uploadUrl: string; fileUrl: string };
}

export async function updateUser(
  orgId: string,
  userId: string,
  payload: Partial<Omit<UpdateUserPayload, "userId" | "orgId">>,
) {
  const res = await axiosServices.put(
    `${BACKEND_BASE_URL}/orgs/${orgId}/users/${userId}`,
    payload,
  );

  return res.data;
}

export async function assignOrUpdateRFID(
  orgId: string,
  userId: string,
  rfidCode: string,
): Promise<AssignRFIDResponse> {
  const res = await axiosServices.put(
    `${BACKEND_BASE_URL}/orgs/${orgId}/users/${userId}/rfid`,
    { rfidCode },
  );

  return res.data as AssignRFIDResponse;
}
