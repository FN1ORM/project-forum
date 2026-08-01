import * as React from "react"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface text-foreground ${className}`}
      {...props}
    />
  )
}
