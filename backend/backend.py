from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DB_NAME = "nicobadi.db"

# ---------------------------
# CONEXIÓN A LA BASE DE DATOS
# ---------------------------
def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


# ---------------------------
# CREAR TABLAS
# ---------------------------
def crear_tablas():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS guardarropas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        usuario_id INTEGER,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        guardarropa_id INTEGER,
        FOREIGN KEY (guardarropa_id) REFERENCES guardarropas(id)
    )
    """)

    conn.commit()
    conn.close()


# ---------------------------
# RUTA TEST
# ---------------------------
@app.route("/")
def home():
    return "Backend Nicobadi funcionando 🚀"


# ---------------------------
# INICIAR APP
# ---------------------------
if __name__ == "__main__":
    crear_tablas()
    app.run(debug=True)
