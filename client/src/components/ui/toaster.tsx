import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastIcon,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start space-x-3 w-full">
              {/* Icon based on variant */}
              <div className="flex-shrink-0 mt-0.5">
                <ToastIcon variant={variant} />
              </div>
              
              {/* Content */}
              <div className="flex-1 grid gap-1 min-w-0">
                {title && (
                  <ToastTitle className="flex items-center space-x-2">
                    <span>{title}</span>
                    {/* Decorative gradient line */}
                    <div className="flex-1 h-px bg-gradient-to-r from-current/20 to-transparent"></div>
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-sm leading-relaxed">
                    {description}
                  </ToastDescription>
                )}
              </div>
              
              {/* Action button if provided */}
              {action && (
                <div className="flex-shrink-0">
                  {action}
                </div>
              )}
            </div>
            
            {/* Animated progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent">
              <div className="h-full bg-gradient-to-r from-white/40 to-white/60 animate-pulse"></div>
            </div>
            
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
