import { z } from "zod";

const MAX_FILE_SIZE = 1 * 1024 * 1024;

export const idVerificationSchema = z.object({
  fullName: z.string().min(2).max(80),

  stateCodeNumber: z.string().min(2),

  stateCode: z.string().min(2),

  stateName: z.string().min(2),

  ppaLga: z.string().min(2),

  idType: z.literal("nysc_id"),

  idNumber: z.string().min(2),

  idFront: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Front image must be less than 1MB",
    }),

  idBack: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Back image must be less than 1MB",
    }),
});

export type IdVerificationSchema = z.infer<
  typeof idVerificationSchema
>;