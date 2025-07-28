export type Admin = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "Admin" | "SuperAdmin";
};
