import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx';

import './index.css'
import App from './App.tsx'
// ✅ Telegram WebApp ready - ENG AVVAL
const tg = (window as any).Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand(); // to'liq ekran
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
