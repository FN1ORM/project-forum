import { LoginButton } from "@/components/login-button"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold mb-6 text-center text-black dark:text-white">Sign In</h1>
        
        {error && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        <LoginButton />
      </div>
    </div>
  )
}
