'use client'
import { useFormStatus } from 'react-dom'
import { Button, ButtonProps } from './ui/button'

export interface SubmitButtonProps extends ButtonProps {
  pendingText?: string
}

export function SubmitButton({ children, pendingText = 'Submitting...', ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  )
}
