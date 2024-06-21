import { z } from "zod";

export const urlSchema = z.object({
  url: z.string().url(),
  expiry: z.number().int().positive().nullable(),
});
