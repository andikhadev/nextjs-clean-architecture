export interface IRq_Login {
    email: string
    password: string
}

export interface IRs_Login {
    ok: boolean
    message: string
    data: {
        token: string
        expires_at: string
    } | null
}
