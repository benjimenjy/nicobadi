// ================================
// CONFIG
// ================================
const BASE_URL = "http://127.0.0.1:5000";

// Helper fetch
async function api(path, method = "GET", body) {
    const opts = {
        method,
        headers: { "Content-Type": "application/json" }
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(BASE_URL + path, opts);
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    return res.json();
}

// ================================
// LOGIN - index.html
// ================================
if (window.location.pathname.includes("index.html")) {

    const btn = document.getElementById("continueBtn");

    btn.addEventListener("click", async () => {
        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();

        if (!nombre || !apellido) {
            alert("Completá nombre y apellido");
            return;
        }

        try {
            const data = await api("/login", "POST", { nombre, apellido });

            // CLAVE ÚNICA
            localStorage.setItem("user_id", data.user_id);

            window.location.href = "guardarropas.html";
        } catch (err) {
            alert("Error login: " + err.message);
        }
    });
}

// ================================
// GUARDARROPAS - guardarropas.html
// ================================
if (window.location.pathname.includes("guardarropas.html")) {

    const lista = document.getElementById("listaGuardarropas");
    const btnNuevo = document.getElementById("btnNuevoGuardarropa");

    async function cargar() {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            window.location.href = "index.html";
            return;
        }

        const guardarropas = await api(`/guardarropas?user_id=${userId}`);
        lista.innerHTML = "";

        guardarropas.forEach(g => {
            const div = document.createElement("div");
            div.className = "item";
            div.innerHTML = `
                <span class="nombre link" data-id="${g.id}">${g.nombre}</span>
                <button class="btn-rojo" data-id="${g.id}">❌</button>
            `;
            lista.appendChild(div);
        });

        document.querySelectorAll(".nombre.link").forEach(el => {
            el.onclick = e => {
                localStorage.setItem("guardarropaSeleccionado", e.target.dataset.id);
                window.location.href = "dentrodelguarda.html";
            };
        });

        document.querySelectorAll(".btn-rojo").forEach(btn => {
            btn.onclick = async e => {
                if (!confirm("¿Borrar guardarropa?")) return;
                await api(`/guardarropas/${e.target.dataset.id}`, "DELETE");
                cargar();
            };
        });
    }

    btnNuevo.onclick = async () => {
        const nombre = prompt("Nombre del guardarropa:");
        if (!nombre) return;
        const userId = localStorage.getItem("user_id");
        await api("/guardarropas", "POST", { user_id: userId, nombre });
        cargar();
    };

    cargar();
}

// ================================
// DENTRO DEL GUARDARROPA
// ================================
if (window.location.pathname.includes("dentrodelguarda.html")) {

    const titulo = document.getElementById("tituloGuardarropa");
    const lista = document.getElementById("listaPrendas");
    const btnAgregar = document.getElementById("btnAgregarPrenda");
    const btnVolver = document.getElementById("btnVolver");

    const gid = localStorage.getItem("guardarropaSeleccionado");
    if (!gid) window.location.href = "guardarropas.html";

    async function cargar() {
        const prendas = await api(`/guardarropas/${gid}/prendas`);
        titulo.textContent = "Guardarropa";

        lista.innerHTML = "";
        prendas.forEach(p => {
            const div = document.createElement("div");
            div.className = "prenda";
            div.innerHTML = `
                <span>${p.nombre}</span>
                <button data-id="${p.id}" class="edit">✏️</button>
                <button data-id="${p.id}" class="del">🗑️</button>
            `;
            lista.appendChild(div);
        });

        document.querySelectorAll(".edit").forEach(b => {
            b.onclick = async e => {
                const nuevo = prompt("Nuevo nombre:");
                if (!nuevo) return;
                await api(`/prendas/${e.target.dataset.id}`, "PUT", { nombre: nuevo });
                cargar();
            };
        });

        document.querySelectorAll(".del").forEach(b => {
            b.onclick = async e => {
                if (!confirm("¿Borrar prenda?")) return;
                await api(`/prendas/${e.target.dataset.id}`, "DELETE");
                cargar();
            };
        });
    }

    btnAgregar.onclick = async () => {
        const nombre = prompt("Nombre de prenda:");
        if (!nombre) return;
        await api(`/guardarropas/${gid}/prendas`, "POST", { nombre });
        cargar();
    };

    btnVolver.onclick = () => {
        window.location.href = "guardarropas.html";
    };

    cargar();
}
