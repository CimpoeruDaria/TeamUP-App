import pymysql

# Funcția care face legatura cu database(cu serverul MySQL)
def get_db_connection():
    connection = pymysql.connect(
        host="localhost",
        user="root",
        password="",  
        database="teamup_db",  # database-ul din myPHPAdmin
        port=3306,
        cursorclass=pymysql.cursors.DictCursor # Returneaza datele ca dictionare
                                    # adica salveaza informatiile sub forma Cheie:Valoare
    )
    return connection
