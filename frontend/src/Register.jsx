import React, { useState } from 'react'

function Register({ onSwitchToLogin }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [favoriteSport, setFavoriteSport] = useState('fotbal')
  const [password, setPassword] = useState('')

  const handleRegister = (e) => {
    e.preventDefault()
    alert(`Cont creat cu succes pentru: ${fullName}! Now TeamUP!`)
    onSwitchToLogin()
  }

  return (
    <div className="card-login max-w-lg">
      <div className="text-center mb-6">
        <div className="inline-block bg-purple-100 text-purple-700 text-3xl p-2.5 rounded-full mb-2 shadow-inner">
          🏃‍♂️📝🏆
        </div>
        <h2 className="text-purple-900 text-2xl font-black tracking-tight">Alătură-te echipei TeamUP</h2>
        <p className="text-gray-500 text-sm mt-1">Creează-ți profilul de sportiv în 30 de secunde</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="label-sportiv">👤 Nume Complet</label>
          <input type="text" placeholder="Andrei Ionescu" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input-sportiv" />
        </div>

        <div>
          <label className="label-sportiv">✉️ Email</label>
          <input type="email" placeholder="andrei@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-sportiv" />
        </div>

        <div>
          <label className="label-sportiv">🔥 Sportul tău principal</label>
          <select value={favoriteSport} onChange={(e) => setFavoriteSport(e.target.value)} className="input-sportiv bg-white cursor-pointer">
            <option value="fotbal">⚽ Fotbal</option>
            <option value="baschet">🏀 Baschet</option>
            <option value="tenis">🎾 Tenis / Padel</option>
            <option value="volei">🏐 Volei</option>
            <option value="altceva">⭐ Alta optiune</option>
          </select>
        </div>

        <div>
          <label className="label-sportiv">🔑 Alege o Parolă</label>
          <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-sportiv" />
        </div>

        <button type="submit" className="buton-intrare-joc">Creează Cont & Intră în echipă →</button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-sm text-gray-600">
        Ai deja cont?{' '}
        <button onClick={onSwitchToLogin} className="text-purple-700 hover:text-purple-900 font-bold hover:underline cursor-pointer bg-transparent border-none">
          Conectează-te aici
        </button>
      </div>
    </div>
  )
}

export default Register