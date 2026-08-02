import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success"
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none"
  
  let variantStyles = ""
  switch (variant) {
    case "primary":
      variantStyles = "bg-primary text-primary-foreground hover:opacity-90"
      break
    case "secondary":
      variantStyles = "bg-surface border border-border text-foreground hover:bg-surface-elevated"
      break
    case "danger":
      variantStyles = "bg-danger text-primary-foreground hover:opacity-90"
      break
    case "ghost":
      variantStyles = "bg-transparent text-foreground hover:bg-surface-elevated"
      break
    case "success":
      variantStyles = "bg-success text-white hover:opacity-90"
      break
  }

  return (
    <button
      className={cn(baseStyles, variantStyles, className)}
      {...props}
    />
  )
}
