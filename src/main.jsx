import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </AuthProvider>
)
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
