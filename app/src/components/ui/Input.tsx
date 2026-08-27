import type { InputHTMLAttributes } from 'react'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-sm border border-bg-dark/10 bg-transparent px-2 py-2 text-body text-text-on-light outline-none focus:border-bg-dark/40"
      {...props}
    />
  )
}
