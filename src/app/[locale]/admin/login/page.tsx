import { signIn } from "../actions";

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Enter both email and password.",
  invalid_credentials: "Incorrect email or password.",
};

export default async function AdminLoginPage(props: PageProps<"/[locale]/admin/login">) {
  const { error } = await props.searchParams;
  const errorMessage = typeof error === "string" ? ERROR_MESSAGES[error] : undefined;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-cream px-4 py-14">
      <div className="card-surface w-full max-w-sm p-8">
        <form action={signIn} className="space-y-4">
          <h1 className="font-display text-xl font-semibold text-ink">Admin sign in</h1>
          {errorMessage ? (
            <p role="alert" className="text-sm text-brand-dark">
              {errorMessage}
            </p>
          ) : null}
          <div>
            <label htmlFor="email" className="field-label mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="password" className="field-label mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-2.5">
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
