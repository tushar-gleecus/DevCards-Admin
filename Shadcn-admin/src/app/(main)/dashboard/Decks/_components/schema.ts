import { z } from "zod";

export const deckSchema = z.object({
  id: z.number(),
  name: z.string(),
});
