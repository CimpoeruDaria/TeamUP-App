import React, { useState } from 'react'

function ForgotPassword({ onSwitchToLogin }) {
  const [email, setEmail] = useState('')

  const handleReset = (e) => {
    e.preventDefault()
    alert(`Un link de resetare a fost trimis la adresa: ${email}`)
    onSwitchToLogin()
  }

  return (
    <div className="card-login">
      <div className="text-center mb-6">
        <div className="inline-block bg-purple-100 text-purple-700 text-3xl p-3 rounded-full mb-3 shadow-inner">
          🔒🤔
        </div>
        <h2 className="text-purple-900 text-2xl font-black tracking-tight">Recuperare Parolă</h2>
        <p className="text-gray-500 text-sm mt-1">Introdu email-ul contului tău și îți trimitem un link de resetare.</p>
      </div>

      <form onSubmit={handleReset} className="space-y-5">
        <div>
          <label className="label-sportiv">✉️ Email-ul tău</label>
          <input type="email" placeholder="nume@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-sportiv" />
        </div>

        <button type="submit" className="buton-intrare-joc">Trimite Link-ul</button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-sm">
        <button onClick={onSwitchToLogin} className="text-purple-700 hover:text-purple-900 font-bold hover:underline cursor-pointer bg-transparent border-none">
          ← Înapoi la Conectare
        </button>
      </div>
    </div>
  )
}

export default ForgotPassword