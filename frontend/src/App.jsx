import React, { useState } from 'react'
import Login from './Login'
import Register from './Register'
import ForgotPassword from './ForgotPassword'
import Dashboard from './Dashboard'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [user, setUser] = useState(null) // salvam userul logat

  // functie apelata cand logarea reuseste
  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setCurrentPage('dashboard') // trimite in dashboard
  }

  // functie apelata cand inregistrarea reuseste
  const handleRegisterSuccess = (userData) => {
    setUser(userData)
    setCurrentPage('dashboard') // trimite in dashboard
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('login')
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-tr from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4 selection:bg-purple-500 selection:text-white font-sans antialiased">
      <div className="w-full flex items-center justify-center animate-fade-in">
        
        {currentPage === 'login' && (
          <Login onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />
        )}
        
        {currentPage === 'register' && (
          <Register onNavigate={setCurrentPage} onRegisterSuccess={handleRegisterSuccess} />
        )}
        
        {currentPage === 'forgot-password' && (
          <ForgotPassword onNavigate={setCurrentPage} />
        )}
        
        {currentPage === 'dashboard' && (
          <Dashboard onLogout={handleLogout} user={user} />
        )}

      </div>
    </div>
  )
}


export default App
