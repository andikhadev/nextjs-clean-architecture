import type { IRq_Login, IRs_Login } from "./login.type"

export async function APIS_Login(payload: IRq_Login): Promise<IRs_Login> {
    const res = await fetch(`${process.env.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
    })

    if (!res.ok) {
        return { ok: false, message: "Login gagal, periksa kembali kredensial Anda.", data: null }
    }

    return res.json()
}
