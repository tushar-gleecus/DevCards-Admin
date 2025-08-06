export type CardContent = {
  id: number;
  name: string;
  short_desc: string;
  category_name: string;
  rich_text: string; // HTML content from TipTap
  status: "Draft" | "published" | "Inactive";
  created_at: string; // ISO timestamp
};
