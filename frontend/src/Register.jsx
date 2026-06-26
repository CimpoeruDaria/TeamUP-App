import React, { useState } from 'react'

function Register({ onNavigate, onRegisterSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      // Trimitem TOATE datele într-o singură cerere curată către Python
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          age: parseInt(age) || 0,
          location: location,
          phone: phone
        })
      })

      const data = await response.json()

      if (response.ok && data.status === "success") {
        alert(data.mesaj || "Contul a fost creat cu succes! ")

        const loggedInUser = {
          id: data.user_id,
          fullName: name,
          location: location
        }
        
        onRegisterSuccess(loggedInUser) // Trimite direct în Dashboard
      } else {
        alert(data.detail || "Eroare la înregistrare!")
      }
    } catch (error) {
      console.error(error)
      alert("Eroare de rețea. Asigură-te că serverul Python rulează!")
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-purple-100/20 text-left">
      <h2 className="text-purple-950 text-4xl font-black tracking-tight text-center mb-2">Creează un cont </h2>
      <p className="text-gray-500 text-sm text-center mb-6">Alătură-te comunității TeamUP</p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1 ml-1">Nume Complet</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-sm" placeholder="Andrei Ionescu" />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1 ml-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-sm" placeholder="andrei@email.com" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1 ml-1">Parolă</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-sm" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1 ml-1">Telefon</label>
            <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-sm" placeholder="07xx xxx xxx" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1 ml-1">Vârstă</label>
            <input type="number" required value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-sm" placeholder="25" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1 ml-1">Oraș / Locație</label>
            <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-sm" placeholder="Bucuresti" />
          </div>
        </div>

        <button type="submit" className="buton-intrare-joc">
          Creează Cont și Intră în Joc →
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Ai deja cont?{' '}
        <button onClick={() => onNavigate('login')} className="text-purple-900 font-bold hover:underline bg-transparent border-none cursor-pointer">
          Autentifică-te
        </button>
      </p>
    </div>
  )
}

export default Register
