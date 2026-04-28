import { z } from "zod"

export const updateProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  fullName: z.string().min(2, "Full name is required").optional(),
  phone: z.string().optional(),
})

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
