# backend.py
from flask import Flask, request, jsonify, send_from_directory, g
from flask_cors import CORS
import sqlite3
import os

# Config
DB_PATH = os.path.join(os.path.dirname(__file__), "nicobadi.db")
STATIC_DIR = os.path.dirname(__file__)  # la raíz del proyecto (donde están index.html etc)

app = Flask(__name__, static_folder=STATIC_DIR)
CORS(app)

# ---------- DB utils ----------
def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

def init_db():
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()
    # users, guardarropas, prendas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS guardarropas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            FOREIGN KEY(usuario_id) REFERENCES users(id)
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guardarropa_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            FOREIGN KEY(guardarropa_id) REFERENCES guardarropas(id)
        );
    """)
    db.commit()
    db.close()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

# ---------- Static routes (sirven los archivos frontend) ----------
@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")

@app.route("/<path:filename>")
def static_files(filename):
    # permite servir index.html, guardarropas.html, style.css, script.js, imágenes, etc
    return send_from_directory(STATIC_DIR, filename)

# ---------- API ----------
@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(force=True)
    nombre = data.get("nombre", "").strip()
    apellido = data.get("apellido", "").strip()
    if not nombre or not apellido:
        return jsonify({"error": "Faltan nombre o apellido"}), 400

    db = get_db()
    cursor = db.cursor()
    # Si ya existe el usuario (mismo nombre+apellido) lo retornamos, sino lo creamos
    cursor.execute("SELECT id FROM users WHERE nombre=? AND apellido=?", (nombre, apellido))
    row = cursor.fetchone()
    if row:
        user_id = row["id"]
    else:
        cursor.execute("INSERT INTO users (nombre, apellido) VALUES (?, ?)", (nombre, apellido))
        db.commit()
        user_id = cursor.lastrowid

    return jsonify({"user_id": user_id, "nombre": nombre, "apellido": apellido})

@app.route("/api/guardarropas", methods=["GET"])
def api_list_guardarropas():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Falta user_id"}), 400
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, nombre FROM guardarropas WHERE usuario_id=?", (user_id,))
    rows = cursor.fetchall()
    res = [{"id": r["id"], "nombre": r["nombre"]} for r in rows]
    return jsonify(res)

@app.route("/api/guardarropas", methods=["POST"])
def api_create_guardarropa():
    data = request.get_json(force=True)
    nombre = data.get("nombre", "").strip()
    user_id = data.get("user_id")
    if not nombre or not user_id:
        return jsonify({"error":"Falta nombre o user_id"}), 400
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO guardarropas (usuario_id, nombre) VALUES (?,?)", (user_id, nombre))
    db.commit()
    return jsonify({"id": cursor.lastrowid, "nombre": nombre}), 201

@app.route("/api/guardarropas/<int:gid>/prendas", methods=["GET"])
def api_list_prendas(gid):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, nombre FROM prendas WHERE guardarropa_id=?", (gid,))
    rows = cursor.fetchall()
    res = [{"id": r["id"], "nombre": r["nombre"]} for r in rows]
    return jsonify(res)

@app.route("/api/guardarropas/<int:gid>/prendas", methods=["POST"])
def api_create_prenda(gid):
    data = request.get_json(force=True)
    nombre = data.get("nombre", "").strip()
    if not nombre:
        return jsonify({"error":"Falta nombre"}), 400
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO prendas (guardarropa_id, nombre) VALUES (?,?)", (gid, nombre))
    db.commit()
    return jsonify({"id": cursor.lastrowid, "nombre": nombre}), 201

# opcional: obtener info de un guardarropa
@app.route("/api/guardarropas/<int:gid>", methods=["GET"])
def api_get_guardarropa(gid):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, usuario_id, nombre FROM guardarropas WHERE id=?", (gid,))
    r = cursor.fetchone()
    if not r:
        return jsonify({"error":"No existe guardarropa"}), 404
    return jsonify({"id": r["id"], "usuario_id": r["usuario_id"], "nombre": r["nombre"]})

# ---------- arrancar ----------
if __name__ == "__main__":
    # si no existe la DB, la creamos
    if not os.path.exists(DB_PATH):
        print("Inicializando base de datos:", DB_PATH)
        init_db()
    app.run(debug=True, host="127.0.0.1", port=5000)
