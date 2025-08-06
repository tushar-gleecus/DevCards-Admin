export type CardContent = {
  id?: number;
  name: string;
  short_description: string;
  description: string;
  category_id: number;
  deck_id: number;
  status: "published" | "draft" | "inactive";
  read_time: number;
  tags: string;
  created_at?: string;
  updated_at?: string;
};