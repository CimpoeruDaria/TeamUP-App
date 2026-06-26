import React, { useState } from 'react'

function Login({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
  e.preventDefault()
  
  try {
    const response = await fetch('http://127.0.0.1:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    })

    const data = await response.json()

    if (response.ok && data.status === "success") {
      // Extragem datele reale trimise direct în obiectul `user` din Python!
      const serverUser = data.user;

      const loggedInUser = {
        id: serverUser.id,
        fullName: serverUser.name,
        favoriteSport: serverUser.favorite_sport, // Vine din noul tău JSON din Python
        level: serverUser.skill_level             // Vine direct din tabela users (Beginner/Intermediate/Advanced)
      }
      
      // Trimitem datele reale și deschidem Dashboard-ul instant (FĂRĂ ALERT!)
      onLoginSuccess(loggedInUser) 
    } else {
      // Intră aici doar dacă response.ok este false (ex: status 400 de la FastAPI)
      alert(data.detail || "Email sau parolă incorectă!")
    }
  } catch (error) {
    console.error(error)
    alert("Nu s-a putut conecta la serverul Python!")
  }
}

  return (
    <div className="card-login">
      <div className="text-center mb-8">
        <h2 className="text-purple-900 text-5xl font-black tracking-tight">TeamUP</h2>
        <p className="text-gray-500 text-sm mt-1">Găsește-ți echipa, organizează meciul, fii MVP!</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="label-sportiv ml-1"> Adresă Email</label>
          <input 
            type="email" placeholder="nume@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)} required className="input-sportiv"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label-sportiv ml-1"> Parolă </label>
            <button 
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-xs text-purple-900 hover:underline font-bold cursor-pointer bg-transparent border-none"
            >
              Ai uitat parola?
            </button>
          </div>
          <input 
            type="password" placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)} required className="input-sportiv"
          />
        </div>

        <button type="submit" className="buton-intrare-joc">Intră în joc </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
        Ești nou pe platformă?{' '}
        <button 
          onClick={() => onNavigate('register')}
          className="text-purple-900 hover:text-purple-900 font-bold hover:underline cursor-pointer bg-transparent border-none"
        >
          Creează un cont gratuit
        </button>
      </div>
    </div>
  )
}

export default Login
