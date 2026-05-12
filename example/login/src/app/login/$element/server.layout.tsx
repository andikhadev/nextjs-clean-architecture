import { CE_LoginForm } from "./client.form"
import { LANG_Login } from "../$lang/id"

export function SE_LoginLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-gray-900">{LANG_Login.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{LANG_Login.subtitle}</p>
                </div>
                <CE_LoginForm />
            </div>
        </div>
    )
}
