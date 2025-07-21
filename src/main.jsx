import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ComparisonProvider } from './context/ComparisonContext'
import { ToastProvider } from './hooks/use-toast'
import { ThemeProvider } from './context/ThemeContext'
import { TooltipProvider } from './components/ui/tooltip'
// // Sentry entegrasyonu için importlar
// import * as Sentry from "@sentry/react";
// // BrowserTracing'i @sentry/integrations paketinden içe aktarıyoruz
// import { BrowserTracing } from "@sentry/integrations"; 

// Sentry.init({
//   dsn: "https://c425c4c98e952e29f72bfe0714721213@o4509702970146816.ingest.de.sentry.io/4509702976176208",
//   integrations: [
//     // BrowserTracing'i doğrudan named import olarak kullanın
//     new BrowserTracing({
//       // Sentry'nin izleme başlıklarını ekleyeceği URL'leri belirtin.
//       // Bu, API isteklerinizin Sentry'de izlenmesini sağlar.
//       // Kendi API URL'nizi veya regex'inizi buraya ekleyin.
//       tracePropagationTargets: ["localhost", /^\//, "http://localhost:8000/api/v1"],
//     }),
//   ],
//   // İşlem izleme için tracesSampleRate'i 1.0 olarak ayarlayarak
//   // işlemlerin %100'ünü yakalayın. Üretimde bu değeri ayarlamanız önerilir.
//   tracesSampleRate: 1.0,
//   // Uygulamanın çalıştığı ortamı belirtin (development, production vb.)
//   environment: import.meta.env.NODE_ENV,
//   // Geliştirme ortamında Sentry debug modunu açın
//   debug: import.meta.env.NODE_ENV === 'development',
//   // environment: import.meta.env.production, // 'development' veya 'production'
// });


const queryClient = new QueryClient();
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <TooltipProvider> 
            <ComparisonProvider>
              <App />
            </ComparisonProvider>
            </TooltipProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
