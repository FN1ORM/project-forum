import { LoginButton } from "@/components/login-button"
import { Card } from "@/components/ui/card"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <Card className="w-full max-w-sm p-8 flex flex-col items-center shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome Back</h1>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          Sign in to access your dashboard, ask questions, and collaborate with your peers.
        </p>
        
        {error && (
          <div className="w-full mb-6 p-4 text-sm text-danger bg-danger/10 rounded-md text-center font-medium">
            {error}
          </div>
        )}

        <div className="w-full">
          <LoginButton />
        </div>
      </Card>
    </div>
  )
}
