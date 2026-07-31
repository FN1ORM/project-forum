'use client'

export function DeleteButton({ action, children }: { action: string | ((formData: FormData) => void | Promise<void>), children?: React.ReactNode }) {
  return (
    <form action={action} onSubmit={(e) => {
      if (!window.confirm("Are you sure you want to delete this?")) {
        e.preventDefault()
      }
    }}>
      {children}
      <button type="submit" className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors">
        Delete
      </button>
    </form>
  )
}
