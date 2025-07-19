import * as React from "react";

// ToastContext'i burada oluşturup dışa aktarıyoruz
export const ToastContext = React.createContext(null);

// useToastContext hook'u
export const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};

// Global 'toast' fonksiyonu kaldırıldı.
// Artık bileşenler içinde toast bildirimleri için useToastContext().toast kullanmalısınız.