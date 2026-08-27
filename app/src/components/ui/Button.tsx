import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

/** DESIGN_SYSTEM.md §5 — nunca full-rounded excepto badges de estado. */
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'rounded-sm px-4 py-2 text-body font-medium disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-bg-dark text-text-on-dark',
    secondary: 'border border-bg-dark/10 bg-transparent text-text-on-light',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
