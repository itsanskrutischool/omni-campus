"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { z } from "zod"

const loginSchema = z.object({
  tenantSlug: z.string().min(1, "School Code is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  redirectTo: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Server Action: Login
 * ────────────────────
 * Handles the 3-field authentication flow.
 */
export async function loginAction(values: LoginInput) {
  const validatedFields = loginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields!" }
  }

  const { tenantSlug, email, password, redirectTo } = validatedFields.data

  try {
    await signIn("credentials", {
      tenantSlug,
      email,
      password,
      redirectTo: redirectTo || "/",
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials or school code!" }
        default:
          return { error: "Something went wrong!" }
      }
    }

    throw error
  }
}

/**
 * Server Action: Logout
 */
export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}
