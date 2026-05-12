import { cookies } from "next/headers"

const SESSION_KEY = "session_token"
const MAX_AGE = 60 * 60 * 24 * 7 // 7 hari

export async function setSession(token: string) {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_KEY, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MAX_AGE,
        path: "/",
    })
}

export async function getSession(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(SESSION_KEY)?.value ?? null
}

export async function clearSession() {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_KEY)
}
