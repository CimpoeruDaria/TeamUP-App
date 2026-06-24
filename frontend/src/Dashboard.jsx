import React from 'react'

function Dashboard({ onLogout }) {
  return (
    <div className="bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-4xl border border-purple-100/20 text-center">
      <h1 className="text-purple-950 text-4xl font-black mb-2">👋 Bine ai venit pe teren, MVP!</h1>
      <p className="text-gray-600 mb-8">Aici vor apărea meciurile din zona ta, terenurile disponibile și echipele care caută jucători.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-8">
        <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
          <h3 className="font-bold text-purple-900 text-lg mb-2">⚽ Meciuri active</h3>
          <p className="text-sm text-gray-600">Sunt 4 meciuri de fotbal programate azi în Craiova.</p>
        </div>
        <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100">
          <h3 className="font-bold text-indigo-900 text-lg mb-2">🏀 Echipe incomplete</h3>
          <p className="text-sm text-gray-600">„Spartanii BC” caută un pivot pentru diseară la ora 20:00.</p>
        </div>
        <div className="p-5 bg-slate-100 rounded-xl border border-gray-200">
          <h3 className="font-bold text-slate-900 text-lg mb-2">🏆 Clasament local</h3>
          <p className="text-sm text-gray-600">Vezi unde te situezi în funcție de meciurile jucate.</p>
        </div>
      </div>

      <button onClick={onLogout} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md cursor-pointer text-sm">
        Ieși din cont 🚪
      </button>
    </div>
  )
}

export default Dashboard