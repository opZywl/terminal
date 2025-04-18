import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
// @ts-ignore
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
