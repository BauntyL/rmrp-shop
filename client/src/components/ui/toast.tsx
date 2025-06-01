import React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border backdrop-blur-xl p-6 pr-8 shadow-2xl transition-all duration-300 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full transform hover:scale-[1.02] hover:shadow-3xl",
  {
    variants: {
      variant: {
        default: "bg-slate-800/90 border-slate-700/50 text-white shadow-slate-900/50",
        destructive: "bg-gradient-to-r from-red-900/90 to-red-800/90 border-red-700/50 text-red-50 shadow-red-900/50",
        success: "bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 border-emerald-700/50 text-emerald-50 shadow-emerald-900/50",
        warning: "bg-gradient-to-r from-amber-900/90 to-amber-800/90 border-amber-700/50 text-amber-50 shadow-amber-900/50",
        info: "bg-gradient-to-r from-blue-900/90 to-blue-800/90 border-blue-700/50 text-blue-50 shadow-blue-900/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border bg-transparent px-3 text-sm font-medium transition-all duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-400/40 group-[.destructive]:hover:border-red-300/60 group-[.destructive]:hover:bg-red-500/20 group-[.destructive]:focus:ring-red-400/40",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-lg p-1.5 text-white/60 opacity-0 transition-all duration-200 hover:text-white hover:bg-white/10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20 group-hover:opacity-100 group-[.destructive]:text-red-200/80 group-[.destructive]:hover:text-red-50 group-[.destructive]:hover:bg-red-500/20 group-[.destructive]:focus:ring-red-400/40",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90 leading-relaxed", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Icon component for different toast types
const ToastIcon = ({ variant }: { variant?: string }) => {
  const iconClass = "h-5 w-5 flex-shrink-0"
  
  switch (variant) {
    case "success":
      return <CheckCircle className={cn(iconClass, "text-emerald-400")} />
    case "destructive":
      return <AlertCircle className={cn(iconClass, "text-red-400")} />
    case "warning":
      return <AlertTriangle className={cn(iconClass, "text-amber-400")} />
    case "info":
      return <Info className={cn(iconClass, "text-blue-400")} />
    default:
      return <Info className={cn(iconClass, "text-slate-400")} />
  }
}

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
}
