import bcrypt
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  
from pydantic import BaseModel
from database import get_db_connection 
from datetime import datetime

# Inițializare aplicație FastAPI
app = FastAPI(title="TeamUP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Structura user pentru Înregistrare
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    age: int
    location: str
    phone: str

# Macheta pentru Login
class UserLogin(BaseModel):
    email: str
    password: str

# Structura pentru user update
class UserUpdate(BaseModel):
    full_name: str
    age: int
    location: str
    phone: str

# RUTA 1: Pagina de pornire
@app.get("/")
def home():
    return {"Bine ai venit pe API-ul aplicatiei TeamUP!"}

# RUTA 2: Înregistrare user
@app.post("/api/register")
def register_user(user_data: UserRegister):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Acest email este deja inregistrat!")

            parola_bytes = user_data.password.encode('utf-8')
            sare = bcrypt.gensalt()
            parola_criptata = bcrypt.hashpw(parola_bytes, sare).decode('utf-8')

            sql = """ 
                INSERT INTO users (name, email, password_hash, age, location, phone) 
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            values_user = (
                user_data.name,
                user_data.email,
                parola_criptata, 
                user_data.age,
                user_data.location,
                user_data.phone
            )
            cursor.execute(sql, values_user)
            new_user_id = cursor.lastrowid
            connection.commit()

            return {
                "status": "success", 
                "mesaj": "Contul a fost creat cu succes!", 
                "user_id": new_user_id
            }
    finally:
        connection.close()

# RUTA 3: Login
@app.post("/api/login")
def login_user(login_data: UserLogin):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, name, password_hash, location FROM users WHERE email = %s", (login_data.email,))
            user = cursor.fetchone() 
            
            if not user:
                raise HTTPException(status_code=400, detail="Email sau parola incorecta!")
            
            parola_trimisa_bytes = login_data.password.encode('utf-8')
            parola_baza_bytes = user['password_hash'].encode('utf-8')
            
            if bcrypt.checkpw(parola_trimisa_bytes, parola_baza_bytes):
                return {
                    "status": "success",
                    "mesaj": "Autentificare reușită!",
                    "user": {
                        "id": user['id'],
                        "name": user['name'],
                        "location": user['location'],
                    }
                }             
            else:
                raise HTTPException(status_code=400, detail="Email sau parola incorecta!")
    finally:
        connection.close()

@app.get("/api/users")
def read_users_from_db():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT id, name, location, phone FROM users"
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        connection.close()

class MatchCreate(BaseModel):
    creator_id: int
    sport_name: str
    location: str
    city: str
    match_date: str  
    match_time: str  
    max_players: int

@app.post("/api/matches/create")
def create_match(match_data: MatchCreate):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO matches (creator_id, sport_name, location, city, match_date, match_time, max_players, available_slots)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                match_data.creator_id,
                match_data.sport_name,
                match_data.location,
                match_data.city,
                match_data.match_date,  
                match_data.match_time,  
                match_data.max_players,
                match_data.max_players 
            )
            cursor.execute(sql, values)
            connection.commit()          
            return {"status": "success", "mesaj": "Meciul a fost organizat cu succes!"}
    finally:
        connection.close()

# RUTA 6: Citirea tuturor meciurilor (🔥 REPARATĂ: Curățare nativă robustă bazată pe timpul serverului)
@app.get("/api/matches")
def get_all_matches(sport: str = None, city: str = None, user_city: str = None): 
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 1. Preluăm absolut toate meciurile din DB pentru evaluare
            cursor.execute("SELECT id, match_date, match_time FROM matches")
            meciuri_existente = cursor.fetchall()
            
            acum = datetime.now() # Ora curentă a serverului la milisecundă
            id_uri_expirate = []
            
            for m in meciuri_existente:
                try:
                    # Combinăm data și ora primite de la MySQL într-un obiect datetime nativ Python
                    data_str = str(m["match_date"])
                    timp_str = str(m["match_time"])
                    if len(timp_str) > 8: 
                        timp_str = timp_str[-8:] # Curățăm eventualele prefixe de zile la timedelta
                        
                    data_ora_meci = datetime.strptime(f"{data_str} {timp_str}", "%Y-%m-%d %H:%M:%S")
                    
                    if data_ora_meci < acum:
                        id_uri_expirate.append(m["id"])
                except Exception:
                    continue

            # 2. Ștergem fizic meciurile identificate ca fiind în trecut
            if id_uri_expirate:
                format_strings = ','.join(['%s'] * len(id_uri_expirate))
                cursor.execute(f"DELETE FROM match_participants WHERE match_id IN ({format_strings})", id_uri_expirate)
                cursor.execute(f"DELETE FROM matches WHERE id IN ({format_strings})", id_uri_expirate)
                connection.commit()
            
            # 3. Rulăm interogarea standard de citire
            sql = """
                SELECT id, creator_id, sport_name, location, city, match_date, match_time, max_players, available_slots 
                FROM matches 
                WHERE 1=1
            """
            params = []
            
            if sport and sport != "Toate":
                sql += " AND sport_name = %s"
                params.append(sport)
                
            if city and city != "Toate":
                sql += " AND city = %s"
                params.append(city)
                
            if user_city and (not city or city == "Toate"):
                sql += " ORDER BY (city = %s) DESC, id DESC"
                params.append(user_city)
            else:
                sql += " ORDER BY id DESC"
                
            cursor.execute(sql, params)
            raw_matches = cursor.fetchall()
            
            cleaned_matches = []
            for m in raw_matches:
                cleaned_matches.append({
                    "id": m["id"],
                    "creator_id": m["creator_id"],
                    "sport_name": m["sport_name"],
                    "location": m["location"],
                    "city": m["city"],
                    "match_date": str(m["match_date"]),
                    "match_time": str(m["match_time"]),
                    "max_players": m["max_players"],
                    "available_slots": m["available_slots"]
                })
                
            return cleaned_matches
    finally:
        connection.close()

# RUTA 7: Gestionare Înscriere / Retragere din Meci
@app.post("/api/matches/{match_id}/toggle-join")
def toggle_match_join(match_id: int, payload: dict):
    action = payload.get("action")
    user_id = payload.get("user_id")
    
    if action not in ["join", "leave"]:
        raise HTTPException(status_code=400, detail="Acțiune invalidă. Folosește 'join' sau 'leave'.")
    if not user_id:
        raise HTTPException(status_code=400, detail="ID-ul utilizatorului lipsește din cerere.")
        
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT available_slots, max_players FROM matches WHERE id = %s", (match_id,))
            match = cursor.fetchone()
            
            if not match:
                raise HTTPException(status_code=404, detail="Meciul nu a fost găsit.")
                
            current_slots = match["available_slots"]
            max_players = match["max_players"]
            
            if action == "join":
                if current_slots <= 0:
                    raise HTTPException(status_code=400, detail="Meciul este deja plin! 🛑")
                
                cursor.execute(
                    "INSERT INTO match_participants (match_id, user_id) VALUES (%s, %s)",
                    (match_id, user_id)
                )
                new_slots = current_slots - 1
            else: 
                if current_slots >= max_players:
                    raise HTTPException(status_code=400, detail="Nu te poți retrage.")
                
                cursor.execute(
                    "DELETE FROM match_participants WHERE match_id = %s AND user_id = %s",
                    (match_id, user_id)
                )
                new_slots = current_slots + 1
                
            cursor.execute("UPDATE matches SET available_slots = %s WHERE id = %s", (new_slots, match_id))
            connection.commit()
            
            return {"status": "success", "available_slots": new_slots}
    finally:
        connection.close()

@app.get("/api/matches/filters")
def get_available_filters():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT DISTINCT sport_name FROM matches")
            sports = [r["sport_name"] for r in cursor.fetchall() if r["sport_name"]]
            
            cursor.execute("SELECT DISTINCT city FROM matches")
            cities = [r["city"] for r in cursor.fetchall() if r["city"]]
            
            return {
                "sports": sports,
                "cities": cities
            }
    finally:
        connection.close()

@app.put("/api/users/{user_id}/update")
def update_user_profile(user_id: int, user_data: UserUpdate):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit.")
            
            sql_user = """
                UPDATE users 
                SET name = %s, age = %s, location = %s, phone = %s 
                WHERE id = %s
            """
            cursor.execute(sql_user, (user_data.full_name, 
                                     user_data.age,
                                     user_data.location, 
                                     user_data.phone, 
                                     user_id))      
            connection.commit()
            
            return {"status": "success", "mesaj": "Profilul a fost actualizat cu succes!"}
    except Exception as e:
        print(f"Eroare SQL: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Eroare MySQL: {str(e)}")
    finally:
        connection.close()

@app.get("/api/matches/{match_id}/participants")
def get_match_participants(match_id: int):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT creator_id FROM matches WHERE id = %s", (match_id,))
            match = cursor.fetchone()
            if not match:
                raise HTTPException(status_code=404, detail="Meciul nu există.")

            cursor.execute("""
                SELECT u.id, u.name, u.age, u.phone 
                FROM match_participants mp
                JOIN users u ON mp.user_id = u.id
                WHERE mp.match_id = %s
                ORDER BY u.name
            """, (match_id,))
            participants = cursor.fetchall()

            return {"participants": participants}
    except Exception as e:
        print(f"❌ Eroare la preluarea participanților: {e}")
        raise HTTPException(status_code=500, detail="Eroare server")
    finally:
        connection.close()

@app.delete("/api/matches/{match_id}")
def delete_match(match_id: int, payload: dict):
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="ID-ul utilizatorului lipsește.")
        
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT creator_id FROM matches WHERE id = %s", (match_id,))
            match = cursor.fetchone()
            if not match:
                raise HTTPException(status_code=404, detail="Meciul nu a fost găsit.")
            if match["creator_id"] != user_id:
                raise HTTPException(status_code=403, detail="Nu ai permisiunea.")
            
            cursor.execute("DELETE FROM match_participants WHERE match_id = %s", (match_id,))
            cursor.execute("DELETE FROM matches WHERE id = %s", (match_id,))
            connection.commit()
            return {"status": "success", "mesaj": "Meciul a fost șters cu succes!"}
    finally:
        connection.close()

@app.delete("/api/users/{user_id}")
def delete_user_account(user_id: int):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit.")

            cursor.execute("DELETE FROM match_participants WHERE user_id = %s", (user_id,))
            cursor.execute("SELECT id FROM matches WHERE creator_id = %s", (user_id,))
            meciuri_create = cursor.fetchall()
            for meci in meciuri_create:
                cursor.execute("DELETE FROM match_participants WHERE match_id = %s", (meci["id"],))

            cursor.execute("DELETE FROM matches WHERE creator_id = %s", (user_id,))
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            connection.commit()
            return {"status": "success", "mesaj": "Contul a fost șters!"}
    finally:
        connection.close()


class EmailCheck(BaseModel):
    email: str

# RUTA NOUĂ: Verifică dacă un email există în baza de date
@app.post("/api/check-email")
def check_email_exists(data: EmailCheck):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (data.email,))
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(status_code=404, detail="Acest email nu este înregistrat în aplicație! ")
                
            return {"status": "success", "message": "Email găsit."}
    finally:
        connection.close()        
