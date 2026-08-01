'use client'

import { FormEvent, useState } from 'react'

export function ValidatedForm({ 
  action, 
  children, 
  className 
}: { 
  action: (formData: FormData) => void, 
  children: React.ReactNode, 
  className?: string 
}) {
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      const file = fileInput.files[0];
      if (file.size > 10 * 1024 * 1024) {
        e.preventDefault();
        setError("File size exceeds 10MB limit.");
        return;
      }
      const allowed = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
      if (!allowed.includes(file.type)) {
        e.preventDefault();
        setError("Unsupported file type. Allowed: PNG, JPG, WEBP, PDF.");
        return;
      }
    }
    setError(null)
  }

  return (
    <form action={action} onSubmit={handleSubmit} className={className}>
      {error && (
        <div className="p-3 mb-4 text-sm font-medium text-red-800 bg-red-100 rounded-md border border-red-200 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}
      {children}
    </form>
  )
}
