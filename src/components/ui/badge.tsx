import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-emerald-500 text-black hover:bg-emerald-500/80",
    secondary: "border-transparent bg-emerald-900/30 text-emerald-400",
    outline: "text-emerald-500 border-emerald-500/30",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono uppercase tracking-tighter",
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
