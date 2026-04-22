import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './global.css'
import App from './App.jsx'
import { ApiProvider } from './context/ApiContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ApiProvider>
        <App />
      </ApiProvider>
    </BrowserRouter>
  </StrictMode>,
)
