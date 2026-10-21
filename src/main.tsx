import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Analytics } from './components/Analytics.tsx'
import { ThemeProvider } from './theme/ThemeContext.tsx'
import { LanguageProvider } from './i18n/LanguageContext.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Analytics />
          <App />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
