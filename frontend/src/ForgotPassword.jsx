import React, { useState } from 'react'

function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('')

  const handleReset = async (e) => {
    e.preventDefault()

    try {
      // Tritem cererea de verificare către API-ul din Python
      const response = await fetch('http://127.0.0.1:8000/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })

      const data = await response.json()

      if (response.ok && data.status === "success") {
        // Dacă emailul există, mergem mai departe cu simularea trimiterii link-ului
        alert(`Un link de resetare a fost trimis la adresa: ${email} `)
        onNavigate('login') // Ne întoarcem la ecranul de login
      } else {
        // Dacă serverul a întors 404 sau altă eroare, afișăm detaliul primit de la backend
        alert(data.detail || "A apărut o eroare la verificarea emailului.")
      }
    } catch (error) {
      alert("Eroare de rețea. Asigură-te că serverul backend este pornit! ")
    }
  }

  return (
    <div className="card-login">
      <div className="text-center mb-6">
        <h2 className="text-purple-900 text-4xl font-black tracking-tight mb-3">Recuperare Parolă</h2>
        <p className="text-gray-500 text-sm mt-1">Introdu email-ul contului tău și îți trimitem un link de resetare.</p>
      </div>

      <form onSubmit={handleReset} className="space-y-5">
        <div>
          <label className="label-sportiv ml-1"> Email</label>
          <input 
            type="email" 
            placeholder="nume@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="input-sportiv" 
          />
        </div>

        <button type="submit" className="buton-intrare-joc">Trimite Link-ul</button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-sm">
        <button 
          type="button" 
          onClick={() => onNavigate('login')} 
          className="text-purple-900 hover:text-purple-900 font-bold hover:underline cursor-pointer bg-transparent border-none"
        >
          Înapoi la Conectare
        </button>
      </div>
    </div>
  )
}

export default ForgotPassword
