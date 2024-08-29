import { z } from 'zod'

export const usernameValidation = z
    .string()
    .min(2, "username must be at least 2 characters")
    .max(20, "username should not exceed 20 characters")
    .regex(/.+@.+\..+/, "username should not contain any special characters")


export const SignUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: "invalid email address" }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' })

})