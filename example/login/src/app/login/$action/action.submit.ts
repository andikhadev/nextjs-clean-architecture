"use server"

import { redirect } from "next/navigation"
import { APIS_Login } from "@/api/auth/login"
import { SFN_SaveSession } from "../$function/sfn.session"

export async function ACT_SubmitLogin(_: unknown, formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await APIS_Login({ email, password })

    if (!result.ok || !result.data) {
        return { error: result.message }
    }

    await SFN_SaveSession(result.data.token)
    redirect("/dashboard")
}
