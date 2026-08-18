import { signIn } from "../actions";

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Enter both email and password.",
  invalid_credentials: "Incorrect email or password.",
};

export default async function AdminLoginPage(props: PageProps<"/[locale]/admin/login">) {
  const { error } = await props.searchParams;
  const errorMessage = typeof error === "string" ? ERROR_MESSAGES[error] : undefined;

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <form action={signIn} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Admin sign in</h1>
        {errorMessage ? (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <button type="submit" className="w-full rounded bg-black px-3 py-2 text-white">
          Sign in
        </button>
      </form>
    </main>
  );
}
