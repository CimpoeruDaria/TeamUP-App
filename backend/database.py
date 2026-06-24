import pymysql

# Funcția care face legatura cu database
def get_db_connection():
    connection = pymysql.connect(
        host="localhost",
        user="root",
        password="",  
        database="teamup_db",  # baza de date din myPHPAdmin
        port=3306,
        cursorclass=pymysql.cursors.DictCursor # Returneaza datele ca dictionare
    )
    return connection