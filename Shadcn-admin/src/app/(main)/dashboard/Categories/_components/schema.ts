import { z } from "zod";

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deck: z.number(),
  deck_name: z.string(),
  created_by: z.any().optional(),
  updated_by: z.any().optional(),
});
