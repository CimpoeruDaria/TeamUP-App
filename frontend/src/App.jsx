import React, { useState } from 'react'
import Login from './Login'
import Register from './Register'
import ForgotPassword from './ForgotPassword'
import Dashboard from './Dashboard'

function App() {
  // Starea care decide ce pagină e activă: 'login', 'register', 'forgotPassword' sau 'dashboard'
  const [currentPage, setCurrentPage] = useState('login')

  return (
    <div className="bg-pagina-sport">
      {currentPage === 'login' && (
        <Login 
          onSwitchToRegister={() => setCurrentPage('register')}
          onSwitchToForgotPassword={() => setCurrentPage('forgotPassword')}
          onLoginSuccess={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'register' && (
        <Register onSwitchToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'forgotPassword' && (
        <ForgotPassword onSwitchToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'dashboard' && (
        <Dashboard onLogout={() => setCurrentPage('login')} />
      )}
    </div>
  )
}

export default App