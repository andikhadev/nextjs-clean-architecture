"use client"

import { useActionState } from "react"
import { ACT_SubmitLogin } from "../$action/action.submit"
import { CFN_ValidateLoginForm } from "../$function/cfn.validate"
import { LANG_Login } from "../$lang/id"

const initialState = { error: "" }

export function CE_LoginForm() {
    const [state, formAction, isPending] = useActionState(ACT_SubmitLogin, initialState)
    const [localError, setLocalError] = useState("")

    const handleSubmit = (formData: FormData) => {
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const validation = CFN_ValidateLoginForm(email, password)
        if (!validation.ok) {
            setLocalError(validation.message)
            return
        }

        setLocalError("")
        formAction(formData)
    }

    const errorMessage = localError || state?.error

    return (
        <form action={handleSubmit} className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {LANG_Login.label_email}
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={LANG_Login.placeholder_email}
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {LANG_Login.label_password}
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={LANG_Login.placeholder_password}
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {isPending ? LANG_Login.btn_loading : LANG_Login.btn_submit}
            </button>
        </form>
    )
}
