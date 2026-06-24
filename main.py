from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import get_db_connection # Import conexiune din database.py
import bcrypt # Biblioteca pentru criptarea parolelor

# Inițializare aplicație FastAPI
app = FastAPI(title="TeamUP API")

# structura user pentru Înregistrare
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    age: int
    location: str
    skill_level: str
    phone: str

# Macheta pentru Login
class UserLogin(BaseModel):
    email: str
    password: str


# RUTA 1: Pagina de pornire
@app.get("/")
def home():
    return {"Bine ai venit pe API-ul aplicatiei TeamUP!"}


# RUTA 2: Înregistrare user (Creează un rând nou în MySQL)
@app.post("/api/register")
def register_user(user_data: UserRegister):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Verificare unicitate adresa email
            cursor.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Acest email este deja inregistrat!")

            # criptare parola
            parola_bytes = user_data.password.encode('utf-8')
            sare = bcrypt.gensalt()
            parola_criptata = bcrypt.hashpw(parola_bytes, sare).decode('utf-8')

            # comanda SQL pentru inserare
            # """ ca textul sa poata fi scris pe mai multe randuri 
            sql = """ 
                INSERT INTO users (name, email, password_hash, age, location, skill_level, phone) 
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            
            values = (
                user_data.name,
                user_data.email,
                parola_criptata, 
                user_data.age,
                user_data.location,
                user_data.skill_level,
                user_data.phone
            )
            
            # executam si salvam in SQL
            cursor.execute(sql, values)
            connection.commit() 
            
            return {"status": "success", "mesaj":"Utilizator inregistrat cu succes!"}
    finally:
        connection.close()


# RUTA 3: Login
@app.post("/api/login")
def login_user(login_data: UserLogin):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # căutăm utilizatorul în funcție de email
            cursor.execute("SELECT id, name, password_hash FROM users WHERE email = %s", (login_data.email,))
            user = cursor.fetchone() # Ne returnează un dicționar cu datele găsite
            
            # dacă email-ul nu există în baza de date
            if not user:
                raise HTTPException(status_code=400, detail="Email sau parola incorecta!")
            
            # verificăm dacă parola trimisă se potrivește cu cea criptată din bază
            parola_trimisa_bytes = login_data.password.encode('utf-8')
            parola_baza_bytes = user['password_hash'].encode('utf-8')
            
            # bcrypt.checkpw compară parola curată cu hash-ul și știe dacă sunt la fel
            if bcrypt.checkpw(parola_trimisa_bytes, parola_baza_bytes):
                return {
                    "status": "success", 
                    "mesaj": f"Te-ai autentificat cu succes! Bine ai revenit, {user['name']}!",
                    "user_id": user['id']
                }
            else:
                raise HTTPException(status_code=400, detail="Email sau parola incorecta!")
    finally:
        connection.close()


# RUTA 4: Citirea utilizatorilor din baza de date
@app.get("/api/users")
def read_users_from_db():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT id, name, location, skill_level, phone FROM users"
            cursor.execute(sql)
            rezultate = cursor.fetchall()
            return rezultate
    finally:
        connection.close()


# Structura pt adaugarea sporturilor in profilul userilor
class UserSport(BaseModel):
    user_id: int
    sport_name: str
    skill_level: str
    


# RUTA 5: Adaugare sporturi in profilul userilor
@app.post("/api/add-sports")
def add_sport_to_user(sport_data: UserSport):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # verificam daca utilizatorul exista
            cursor.execute("SELECT id FROM users WHERE id = %s", (sport_data.user_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Utilizatorul nu exista!")

            # inseram sportul in tabel
            sql = """
                INSERT INTO user_sports (user_id, sport_name, skill_level)
                VALUES (%s, %s, %s)
            """
            values = (sport_data.user_id, sport_data.sport_name, sport_data.skill_level)
            
            cursor.execute(sql, values)
            connection.commit()
            
            return {"status": "success", "mesaj": f"Sportul {sport_data.sport_name} a fost adaugat cu succes!"}
    finally:
        connection.close() 


# RUTA 6: citeste sporturile unui utilizator
@app.get("/api/users/{user_id}/sports")
def get_user_sports(user_id: int):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Luăm doar sporturile care aparțin de user_id-ul cerut
            sql = "SELECT id, sport_name, skill_level FROM user_sports WHERE user_id = %s"
            cursor.execute(sql, (user_id,))
            sports = cursor.fetchall()
            
            # Dacă utilizatorul nu are niciun sport adăugat încă, returnăm o listă goală []
            return sports
    finally:
        connection.close()


# RUTA 7: Algoritmul pt gasirea partenerilor de joc
@app.get("/api/matchmaking/{user_id}")
def get_matches(user_id: int):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Aflăm locația utilizatorului curent
            cursor.execute("SELECT location FROM users WHERE id = %s", (user_id,))
            current_user = cursor.fetchone()
            
            if not current_user:
                raise HTTPException(status_code=404, detail="Utilizatorul nu exista!")
                
            user_location = current_user['location']

            # Cautam oamenii din aceeasi locatie care joaca acelasi sport
            sql = """
                SELECT DISTINCT 
                    u.id AS partner_id,
                    u.name AS partner_name,
                    u.phone AS partner_phone,
                    u.location,
                    us2.sport_name,
                    us2.skill_level AS partner_skill
                FROM user_sports us1
                JOIN user_sports us2 ON us1.sport_name = us2.sport_name
                JOIN users u ON us2.user_id = u.id
                WHERE us1.user_id = %s           -- Sporturile userului
                  AND u.location = %s            -- Din orașul userului
                  AND u.id != %s                 -- Să nu fie acel user
            """
            
            cursor.execute(sql, (user_id, user_location, user_id))
            matches = cursor.fetchall()
            
            return {
                "status": "success",
                "total_matches": len(matches),
                "matches": matches
            }
    finally:
        connection.close()