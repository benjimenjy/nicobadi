from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

# -------------------------
# BASE DE DATOS
# -------------------------
def get_db():
    return sqlite3.connect("database.db")

def init_db():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS guardarropas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        nombre TEXT
    )
    """)

    db.commit()
    db.close()

init_db()

# -------------------------
# LOGIN
# -------------------------
@app.route("/login", methods=["POST"])
def login():
    nombre = request.json["nombre"]

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT id FROM users WHERE nombre = ?", (nombre,))
    user = cursor.fetchone()

    if user is None:
        cursor.execute("INSERT INTO users (nombre) VALUES (?)", (nombre,))
        db.commit()
        user_id = cursor.lastrowid
    else:
        user_id = user[0]

    db.close()

    return jsonify({"user_id": user_id})

# -------------------------
# GUARDARROPAS
# -------------------------
@app.route("/guardarropas/<int:user_id>")
def obtener_guardarropas(user_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT id, nombre FROM guardarropas WHERE user_id = ?",
        (user_id,)
    )

    data = cursor.fetchall()
    db.close()

    return jsonify(data)

@app.route("/guardarropas", methods=["POST"])
def crear_guardarropa():
    user_id = request.json["user_id"]
    nombre = request.json["nombre"]

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO guardarropas (user_id, nombre) VALUES (?, ?)",
        (user_id, nombre)
    )

    db.commit()
    db.close()

    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(debug=True)
