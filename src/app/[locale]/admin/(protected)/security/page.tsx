import { MfaManager } from "@/components/admin/MfaManager";

export default function AdminSecurityPage() {
  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-ink">Security</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Since this is a shared admin login, turning on two-factor auth protects every admin action
        behind more than just the password.
      </p>
      <div className="mt-6">
        <MfaManager />
      </div>
    </div>
  );
}
