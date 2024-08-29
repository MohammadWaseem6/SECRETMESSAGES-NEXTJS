import { z } from "zod"


export const MessageSchema = z.object({
    content: z.string()
        .min(10, { message: "content must be at least 10 characters" })
        .max(1000, { message: "content must be less than 1000 characters" }),

})