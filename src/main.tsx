import { StrictMode } from 'react'
import 'remixicon/fonts/remixicon.css'
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// trigger theme initialization after the app is rendered to avoid hydration mismatch
