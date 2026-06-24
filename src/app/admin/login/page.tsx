import { AdminLoginForm } from './AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-semibold">後台登入</h1>
        <AdminLoginForm />
      </div>
    </div>
  )
}
