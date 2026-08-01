import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success"
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
  
  let variantStyles = ""
  switch (variant) {
    case "default":
      variantStyles = "bg-muted text-muted-foreground"
      break
    case "success":
      variantStyles = "bg-success/10 text-success"
      break
  }

  return (
    <span
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    />
  )
}
