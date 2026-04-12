import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'gold' | 'status'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase transition-colors",
        {
          'border-transparent bg-primary text-primary-foreground': variant === 'default',
          'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
          'border-transparent bg-destructive text-destructive-foreground': variant === 'destructive',
          'border-border text-foreground': variant === 'outline',
          'border-gold/30 bg-gold/10 text-gold': variant === 'gold',
          'border-current/20 bg-current/8': variant === 'status',
        },
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
