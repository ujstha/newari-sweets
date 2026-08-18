import { MfaManager } from "@/components/admin/MfaManager";

export default function AdminSecurityPage() {
  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="text-xl font-semibold">Security</h1>
      <p className="mt-1 text-sm text-gray-600">
        Since this is a shared admin login, turning on two-factor auth protects every admin action
        behind more than just the password.
      </p>
      <div className="mt-6">
        <MfaManager />
      </div>
    </main>
  );
}
