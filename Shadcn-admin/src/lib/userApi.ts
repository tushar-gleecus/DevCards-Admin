import apiClient from "./api-client";

let usersCache: any[] | null = null;

export async function getUsers() {
  if (usersCache) {
    return usersCache;
  }

  try {
    const res = await apiClient.get("/api/users/");
    usersCache = res.data;
    return usersCache;
  } catch (err: any) {
    throw new Error(err.message || "Unknown error");
  }
}

export async function getUserName(id: number) {
  const users = await getUsers();
  const user = users.find((u) => u.id === id);
  return user ? `${user.first_name} ${user.last_name}` : "Unknown";
}
