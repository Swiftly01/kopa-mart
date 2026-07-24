
import { MAX_FILE_SIZE } from "@/types/sellerOnboarding";
import { z } from "zod";

const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);

const idImageSchema = (label: "Front" | "Back") =>
  z
    .instanceof(File, {
      message: `Please upload a photo of the ${label.toLowerCase()} of your ID`,
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `${label} image must be less than ${maxSizeMB}MB`,
    });

export const idVerificationSchema = z.object({
  fullName: z.string().min(2).max(80),

  stateCodeNumber: z.string().min(2),

  stateCode: z.string().min(2),

  stateName: z.string().min(2),

  ppaLga: z.string().min(2),

  idType: z.literal("nysc_id"),

  idNumber: z.string().min(2),

  idFront: idImageSchema("Front"),

  idBack: idImageSchema("Back"),
});

export type IdVerificationSchema = z.infer<typeof idVerificationSchema>;