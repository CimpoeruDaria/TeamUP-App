import React, { useState, useEffect } from 'react'

function Dashboard({ onLogout, user }) {

  const [userData, setUserData] = useState({
    id: user?.id || 1,
    fullName: user?.fullName || user?.name || user?.full_name || "Sportiv",
    location: user?.location || user?.user?.location || user?.oras || "Nespecificata"
  })

  const [meciuri, setMeciuri] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false) 


  const [participanti, setParticipanti] = useState([])
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false)

  const [optiuniSporturi, setOptiuniSporturi] = useState([])
  const [optiuniOrase, setOptiuniOrase] = useState([])

  const [filtruSport, setFiltruSport] = useState('Toate')
  const [filtruOras, setFiltruOras] = useState('Toate')

  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const [sportAles, setSportAles] = useState('⚽ Fotbal')
  const [oras, setOras] = useState('')       
  const [locatie, setLocatie] = useState('') 
  const [dataMeci, setDataMeci] = useState('')
  const [oraMeci, setOraMeci] = useState('')
  const [maxJucatori, setMaxJucatori] = useState(10)

  const [editNume, setEditNume] = useState(userData.fullName)
  const [editVarsta, setEditVarsta] = useState(user?.age || "")       
  const [editLocatie, setEditLocatie] = useState(userData.location)   
  const [editTelefon, setEditTelefon] = useState(user?.phone || "")

  const fetchFiltreDisponibile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/matches/filters')
      if (response.ok) {
        const data = await response.json()
        setOptiuniSporturi(data.sports || [])
        setOptiuniOrase(data.cities || [])
      }
    } catch (error) {
      console.error(error)
    }
  }


  const fetchMeciuri = async () => {
    try {
      const currentUserId = userData?.id || user?.id || 1;
      
      const url = new URL('http://127.0.0.1:8000/api/matches')
      if (filtruSport !== 'Toate') url.searchParams.append('sport', filtruSport)
      if (filtruOras !== 'Toate') url.searchParams.append('city', filtruOras)

      const responseMatches = await fetch(url)
      if (!responseMatches.ok) return;
      const toateMeciurile = await responseMatches.json()

      const meciuriCuStareInscriere = await Promise.all(
        toateMeciurile.map(async (meci) => {
          try {
            const resPart = await fetch(`http://127.0.0.1:8000/api/matches/${meci.id}/participants`);
            if (resPart.ok) {
              const dataPart = await resPart.json();
              const esteInscris = (dataPart.participants || []).some(p => p.id === currentUserId);
              return { ...meci, inscris: esteInscris };
            }
          } catch (e) {
            console.log("Eroare ignorată la citire participanți (meci probabil curățat):", e);
          }
          return { ...meci, inscris: false };
        })
      );

      setMeciuri(meciuriCuStareInscriere)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchParticipanti = async (matchId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/matches/${matchId}/participants`)
      if (response.ok) {
        const data = await response.json()
        setParticipanti(data.participants || [])
        setIsParticipantsModalOpen(true)
      }
    } catch (error) {
      alert("Nu s-a putut încărca lista de participanți.")
    }
  }

  useEffect(() => {
    fetchFiltreDisponibile()
    fetchMeciuri()
  }, [])

  useEffect(() => {
    fetchMeciuri()
  }, [filtruSport, filtruOras, userData.location])

  useEffect(() => {
    if (filtruSport !== 'Toate' || filtruOras !== 'Toate') {
      setIsFirstLoad(false)
    }
  }, [filtruSport, filtruOras])

  useEffect(() => {
    const fetchDateUtilizatorCurent = async () => {
      try {
        const currentUserId = user?.id || user?.user?.id || 1;
        const response = await fetch('http://127.0.0.1:8000/api/users');
        if (response.ok) {
          const totiUtilizatorii = await response.json();
          const gasit = totiUtilizatorii.find(u => u.id === currentUserId);
          
          if (gasit) {
            setUserData({
              id: gasit.id,
              fullName: gasit.name,
              location: gasit.location || ""
            });
            
            setEditNume(gasit.name);
            setEditLocatie(gasit.location || "");
            setEditVarsta(gasit.age || "");
            setEditTelefon(gasit.phone || "");
          }
        }
      } catch (error) {
        console.error("Eroare la auto-extragerea profilului:", error);
      }
    };

    fetchDateUtilizatorCurent();
  }, [user]);

  const handleUpdateProfil = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userData.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: editNume,
          age: parseInt(editVarsta) || 0,
          location: editLocatie,
          phone: editTelefon
        })
      })
      const data = await response.json()
      if (response.ok && data.status === "success") {
        setUserData({
          ...userData,
          fullName: editNume,
          location: editLocatie
        })
        setIsProfileModalOpen(false)
        alert("Profilul a fost salvat cu succes! ")
      } else {
        alert(data.detail || "Eroare la salvarea datelor.")
      }
    } catch (error) {
      alert("Eroare de rețea la actualizarea profilului.");
    }
  }

  const handleCreeazaMeci = async (e) => {
    e.preventDefault()
    const dataOraCurenta = new Date();
    const dataOraMeci = new Date(`${dataMeci}T${oraMeci}`);

    if (dataOraMeci < dataOraCurenta) {
      alert(" Nu poți organiza un meci în trecut!");
      return;
    }

    const meciNou = {
      creator_id: userData.id,
      sport_name: sportAles,
      location: locatie,
      city: oras, 
      match_date: dataMeci, 
      match_time: oraMeci,  
      max_players: parseInt(maxJucatori) || 2
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/matches/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meciNou)
      })
      const data = await response.json()
      if (response.ok && data.status === "success") {
        setIsModalOpen(false)
        setOras('')
        setLocatie('')
        setDataMeci('')
        setOraMeci('')
        setMaxJucatori(10)
        fetchMeciuri() 
        fetchFiltreDisponibile() 
      }
    } catch (error) {
      alert("Eroare de rețea!")
    }
  }

  const handleAlaturare = async (id) => {
    try {
      const meciCurent = meciuri.find(m => m.id === id);
      if (!meciCurent) return;
      
      const actiune = meciCurent.inscris ? 'leave' : 'join';
      const currentUserId = userData?.id || user?.id;

      const response = await fetch(`http://127.0.0.1:8000/api/matches/${id}/toggle-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: actiune,
          user_id: currentUserId 
        })
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        setMeciuri(meciuri.map(meci => 
          meci.id === id 
            ? { ...meci, available_slots: data.available_slots, inscris: !meci.inscris } 
            : meci
        ));
      }
    } catch (error) {
      console.error(error)
    }
  };

  const handleStergeMeci = async (matchId) => {
    if (!window.confirm("Ești sigur că vrei să ștergi definitiv acest meci? ")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/matches/${matchId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userData.id })
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        alert("Meciul a fost anulat și șters! ");
        setMeciuri(prevMeciuri => prevMeciuri.filter(meci => meci.id !== matchId));
        fetchFiltreDisponibile(); 
      } else {
        alert(data.detail || "Eroare la ștergerea meciului.");
      }
    } catch (error) {
      alert("Eroare de rețea la ștergerea meciului.");
    }
  };

  const handleStergeCont = async () => {
    const confirmare1 = window.confirm("Ești sigur că vrei să îți ștergi definitiv contul? Această acțiune este ireversibilă și va șterge toate meciurile organizate de tine!");
    if (!confirmare1) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userData.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        alert("Contul tău a fost șters cu succes!");
        setIsProfileModalOpen(false);
        onLogout(); 
      } else {
        alert(data.detail || "Eroare la ștergerea contului.");
      }
    } catch (error) {
      alert("Eroare de rețea la ștergerea contului.");
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-2xl w-full max-w-5xl border border-purple-100/20 relative text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-gray-100 mb-8 gap-4">
        <div>
          <h1 className="text-purple-900 text-3xl font-black tracking-tight">Salut, {userData.fullName}! </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Locația ta de bază: <span className="font-bold text-purple-900">{userData.location || "Nespecificată"}</span>
          </p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setIsProfileModalOpen(true)} className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl transition text-sm border border-purple-200/50 cursor-pointer">
            Editează Profil 
          </button>
          <button onClick={onLogout} className="px-5 py-2 bg-zinc-200/70 hover:bg-red-50 hover:text-red-800 text-slate-700 font-bold rounded-xl transition text-sm border border-slate-300/60 cursor-pointer">
            Ieși din cont 
          </button>
        </div>
      </div>

      {/* CASSETĂ FILTRE */}
      <div className="bg-white-100 border border-slate-200 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/2">
          <label className="block text-xs font-bold text-purple-900 uppercase mb-1 ml-1">Filtrează după Sport</label>
          <select value={filtruSport} onChange={(e) => setFiltruSport(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:border-purple-700 cursor-pointer">
            <option value="Toate">Toate sporturile active</option>
            {optiuniSporturi.map((sport, index) => <option key={index} value={sport}>{sport}</option>)}
          </select>
        </div>

        <div className="w-full md:w-1/2 ">
          <label className="block text-xs font-bold text-purple-900 uppercase mb-1 ml-1">Filtrează după Localitate</label>
          <select value={filtruOras} onChange={(e) => setFiltruOras(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:border-purple-700 cursor-pointer">
            <option value="Toate">Toate orașele active</option>
            {optiuniOrase.map((city, index) => <option key={index} value={city}>{city}</option>)}
          </select>
        </div>
      </div>

      {/*  SECȚIUNEA: MECIURILE MELE */}
      <div className="mb-10 b-t pt-2">
        <h2 className="text-3xl font-black text-emerald-900 tracking-tight mb-4 flex items-center gap-2">
          Meciuri la care participi
        </h2>
        
        {meciuri.filter(m => m.inscris).length === 0 ? (
          <p className="text-gray-400 text-l italic">
            Nu ești înscris la niciun eveniment. Alătură-te unui meci din lista de mai jos! 
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {meciuri.filter(m => m.inscris).map((meci) => (
              <div key={`agenda-${meci.id}`} className="p-5 rounded-2xl border bg-emerald-50/40 border-emerald-200 ring-2 ring-emerald-500/10 shadow-sm flex flex-col justify-between h-52">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">{meci.sport_name}</span> 
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800">Confirmat</span>
                  </div>
                  <h3 className="font-bold text-purple-950 text-base line-clamp-1">{meci.location} ({meci.city})</h3>
                  <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2 mb-2">
                    <span> Data {meci.match_date}</span> 
                    <span>Ora {
                      meci.match_time 
                        ? (meci.match_time.includes(':') && meci.match_time.indexOf(':') === 1 
                            ? `0${meci.match_time}` 
                            : meci.match_time
                          ).substring(0, 5)
                        : ''
                    }</span>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <button onClick={() => handleAlaturare(meci.id)} className="w-full py-2 bg-emerald-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition duration-500 group cursor-pointer">
                    <span className="block group-hover:hidden">Înscris</span>
                    <span className="hidden group-hover:block">Retrage-te din meci </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-100 mb-8" />

      {/* Secțiunea Meciuri Globale */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-purple-950 tracking-tight">Meciuri noi</h2>
          <button onClick={() => setIsModalOpen(true)} className="text-l bg-purple-800 hover:bg-purple-900 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer">+ Organizează un Meci</button>
        </div>

        {meciuri.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center italic">Nu s-au găsit meciuri care să corespundă filtrelor selectate. </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {meciuri.map((meci) => (
              <div key={meci.id} className={`p-5 rounded-2xl border transition duration-300 shadow-sm flex flex-col justify-between h-52 ${meci.inscris ? 'bg-emerald-50/60 border-emerald-200 ring-2 ring-emerald-500/20' : 'bg-slate-50/50 border-slate-200/60 hover:shadow-md'}`}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">{meci.sport_name}</span> 
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${meci.available_slots === 0 ? 'bg-red-100 text-red-700' : meci.inscris ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>{meci.available_slots === 0 ? 'Meci Plin ' : `${meci.available_slots} locuri rămase`}</span>
                  </div>
                  <h3 className="font-bold text-purple-950 text-base line-clamp-1">{meci.location} ({meci.city})</h3>
                  <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2 mb-2">
                    <span>Data {meci.match_date}</span> 
                    <span>Ora {
                      meci.match_time 
                        ? (meci.match_time.includes(':') && meci.match_time.indexOf(':') === 1 
                            ? `0${meci.match_time}` 
                            : meci.match_time
                          ).substring(0, 5)
                        : ''
                    }</span>
                  </p>
                </div>
                
                <div className="space-y-2">
                  {meci.creator_id === userData.id && (
                    <div className="flex gap-2 w-full">
                      <button onClick={() => fetchParticipanti(meci.id)} className="w-1/2 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-950 font-bold rounded-xl text-xs transition cursor-pointer">
                        Înscrieri 
                      </button>
                      <button onClick={() => handleStergeMeci(meci.id)} className="w-1/2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition cursor-pointer border border-red-200/40">
                        Șterge 
                      </button>
                    </div>
                  )}
                  <button onClick={() => handleAlaturare(meci.id)} disabled={meci.available_slots === 0 && !meci.inscris} className={`w-full py-2 rounded-xl font-bold text-sm transition duration-200 ${meci.inscris ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md transition text-white cursor-pointer' : meci.available_slots === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-800 hover:bg-purple-900 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer'}`}>
                    {meci.inscris ? 'Înscris' : meci.available_slots === 0 ? 'Meci Ocupat' : 'Alătură-te meciului → '}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: ORGANIZEAZĂ MECI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100">
            <h3 className="text-purple-950 text-2xl font-black mb-1">Organizează un Meci </h3>
            <p className="text-gray-500 text-xs mb-6">Completează detaliile evenimentului tău</p>
            <form onSubmit={handleCreeazaMeci} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-purple-950 uppercase mb-1 ml-1">Alege Sportul</label>
                <select value={sportAles} onChange={(e) => setSportAles(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                  <option value="⚽ Fotbal">⚽ Fotbal</option>
                  <option value="🏀 Baschet">🏀 Baschet</option>
                  <option value="🎾 Tenis">🎾 Tenis</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-950 uppercase mb-1 ml-1">Oraș / Localitate</label>
                  <input type="text" required placeholder="ex: Craiova" value={oras} onChange={(e) => setOras(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-950 uppercase mb-1 ml-1">Locație / Teren</label>
                  <input type="text" required placeholder="ex: Sintetic Flux" value={locatie} onChange={(e) => setLocatie(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-950 uppercase mb-1 ml-1">Data</label>
                  <input type="date" required value={dataMeci} onChange={(e) => setDataMeci(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-950 uppercase mb-1 ml-1">Ora</label>
                  <input type="time" required value={oraMeci} onChange={(e) => setOraMeci(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-purple-950 uppercase mb-1 ml-1">Număr Jucători</label>
                <input type="number" required min="2" max="100" value={maxJucatori} onChange={(e) => setMaxJucatori(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm cursor-pointer">Anulează</button>
                <button type="submit" className="w-1/2 py-2.5 bg-purple-800 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer">Lansează Meciul </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITARE PROFIL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100">
            <h3 className="text-purple-950 text-2xl font-black mb-1">Setări Profil </h3>
            <p className="text-gray-500 text-xs mb-6">Modifică numele contului tău</p>
            <form onSubmit={handleUpdateProfil} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-purple-950 uppercase mb-1 ml-1">Nume Complet</label>
                <input type="text" required value={editNume} onChange={(e) => setEditNume(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-950 uppercase mb-1 ml-1">Vârstă</label>
                  <input type="number" required value={editVarsta} onChange={(e) => setEditVarsta(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-950 uppercase mb-1 ml-1">Localitate</label>
                  <input type="text" required value={editLocatie} onChange={(e) => setEditLocatie(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-800" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-purple-950 uppercase mb-1 ml-1">Număr Telefon</label>
                <input type="text" required value={editTelefon} onChange={(e) => setEditTelefon(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-800" />
              </div>

              <hr className="border-slate-100 my-4" />
              <div>
                <button type="button" onClick={handleStergeCont} className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition border border-red-200/40 cursor-pointer text-center">
                  Șterge definitiv contul TeamUP 
                </button>
              </div>
              <hr className="border-slate-100 my-4" />             

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer">Anulează</button>
                <button type="submit" className="w-1/2 py-2.5 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-xl text-sm shadow-md transition cursor-pointer">Salvează Datele </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LISTĂ PARTICIPANȚI */}
      {isParticipantsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 text-left">
            <h3 className="text-purple-950 text-2xl font-black mb-1">Persoanele înscrise </h3>
            <p className="text-gray-500 text-xs mb-4">Lista celor care vin la meciul organizat de tine</p>
            
            <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
              {participanti.length === 0 ? (
                <p className="text-gray-400 text-sm italic text-center py-4">Încă nu s-a înscris nimeni la acest meci. </p>
              ) : (
                participanti.map((p, index) => (
                  <div key={p.id || index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-purple-950 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">Tel. {p.phone || "Fără telefon"} | {p.age} ani</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">Prezent ✓</span>
                  </div>
                ))
              )}
            </div>

            <button onClick={() => setIsParticipantsModalOpen(false)} className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-sm transition shadow-md cursor-pointer">
              Închide fereastra
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard
