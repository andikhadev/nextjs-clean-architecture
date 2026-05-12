"use server"

import { setSession, clearSession } from "@/lib/session"

export async function SFN_SaveSession(token: string) {
    await setSession(token)
}

export async function SFN_DestroySession() {
    await clearSession()
}
