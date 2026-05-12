interface T_ValidationResult {
    ok: boolean
    message: string
}

export function CFN_ValidateLoginForm(email: string, password: string): T_ValidationResult {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { ok: false, message: "Format email tidak valid." }
    }

    if (!password || password.length < 8) {
        return { ok: false, message: "Password minimal 8 karakter." }
    }

    return { ok: true, message: "" }
}
