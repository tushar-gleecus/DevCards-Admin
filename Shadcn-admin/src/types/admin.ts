export type Admin = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "Admin" | "SuperAdmin";
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
};
