// src/components/ui/toaster.jsx

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider, // <-- Bu ToastProvider, ./toast.jsx'ten (Radix'in sağlayıcısı) geliyor
  ToastTitle,
  ToastViewport, // <-- Bu ToastViewport da ./toast.jsx'ten geliyor
} from "./toast";
import { useToastContext } from "../../hooks/toast-utils"; // Bizim özel hook bağlam tüketicimiz

export function Toaster() {
  const { toasts } = useToastContext();

  return (
    // Radix'in ToastProvider'ı, ToastViewport ve Toast bileşenlerini sarmalamalıdır
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
