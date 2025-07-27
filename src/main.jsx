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
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n';

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://c425c4c98e952e29f72bfe0714721213@o4509702970146816.ingest.de.sentry.io/4509702976176208",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  
  sendDefaultPii: true
});



const queryClient = new QueryClient();
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
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
      </I18nextProvider>
    </QueryClientProvider>
  </StrictMode>,
)
