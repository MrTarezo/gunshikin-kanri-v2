import * as React from "react"
import { cn } from "@/lib/utils"


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 military-mono uppercase tracking-wider",
          {
            "tactical-button hover:scale-105 hover:shadow-lg": variant === "default",
            "alert-status text-white hover:scale-105": variant === "destructive",
            "tactical-border bg-transparent text-yellow-400 hover:bg-yellow-400 hover:bg-opacity-10 hover:scale-105": variant === "outline",
            "bg-gradient-to-r from-gray-600 to-gray-700 text-yellow-300 border border-gray-500 hover:from-gray-500 hover:to-gray-600 hover:scale-105": variant === "secondary",
            "hover:bg-yellow-400 hover:bg-opacity-10 hover:text-yellow-300": variant === "ghost",
            "text-yellow-400 underline-offset-4 hover:underline hover:text-yellow-300": variant === "link"
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3 text-xs": size === "sm",
            "h-11 rounded-md px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon"
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }