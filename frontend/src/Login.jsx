import React, { useState } from 'react'

function Login({ onSwitchToRegister, onSwitchToForgotPassword, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    console.log("Date login:", { email, password })
    // Când logarea reușește, trimitem utilizatorul în Dashboard
    onLoginSuccess()
  }

  return (
    <div className="card-login">
      <div className="text-center mb-8">
        <div className="inline-block bg-purple-100 text-purple-700 text-3xl p-3 rounded-full mb-3 shadow-inner">
          ⚽🏀🏆
        </div>
        <h2 className="text-purple-900 text-3xl font-black tracking-tight">TeamUP</h2>
        <p className="text-gray-500 text-sm mt-1">Găsește-ți echipa, organizează meciul, fii MVP!</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="label-sportiv">✉️ Adresă Email</label>
          <input 
            type="email" placeholder="nume@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)} required className="input-sportiv"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label-sportiv">🔑 Parolă securizată</label>
            <button 
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-xs text-purple-700 hover:underline font-medium cursor-pointer bg-transparent border-none"
            >
              Ai uitat parola?
            </button>
          </div>
          <input 
            type="password" placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)} required className="input-sportiv"
          />
        </div>

        <button type="submit" className="buton-intrare-joc">Intră în joc →</button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
        Ești nou pe platformă?{' '}
        <button 
          onClick={onSwitchToRegister}
          className="text-purple-700 hover:text-purple-900 font-bold hover:underline cursor-pointer bg-transparent border-none"
        >
          Creează un cont gratuit
        </button>
      </div>
    </div>
  )
}

export default Login