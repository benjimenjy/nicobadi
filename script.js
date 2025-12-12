// ==========================================================
// GUARDAR DATOS DEL USUARIO AL HACER LOGIN
// ==========================================================

// Esto se ejecuta SOLO en index.html
if (window.location.pathname.includes("index.html")) {

    const continuarBtn = document.getElementById("continuarBtn");

    if (continuarBtn) {
        continuarBtn.addEventListener("click", () => {
            const nombre = document.getElementById("nombre").value.trim();
            const apellido = document.getElementById("apellido").value.trim();

            if (nombre === "" || apellido === "") {
                alert("Por favor completa nombre y apellido.");
                return;
            }

            const usuario = { nombre, apellido };

            // Guardamos el usuario en LocalStorage
            localStorage.setItem("usuario", JSON.stringify(usuario));

            // Redirigimos a la lista de guardarropas
            window.location.href = "guardarropas.html";
        });
    }
}



// ==========================================================
// LISTA DE GUARDARROPAS
// (guardarropas.html)
// ==========================================================

if (window.location.pathname.includes("guardarropas.html")) {

    const lista = document.getElementById("listaGuardarropas");
    const btnNuevo = document.getElementById("btnNuevoGuardarropa");

    function cargarGuardarropas() {
        let guardarropas = JSON.parse(localStorage.getItem("guardarropas")) || [];
        lista.innerHTML = "";

        guardarropas.forEach((g, index) => {
            const div = document.createElement("div");
            div.className = "item-guardarropa";

            div.innerHTML = `
                <span class="nombre-guardarropa" data-index="${index}">${g.nombre}</span>

                <button class="btn-verde" data-ver="${index}">➕</button>
                <button class="btn-rojo" data-eliminar="${index}">❌</button>
            `;

            lista.appendChild(div);
        });
    }

    // Crear nuevo guardarropa
    btnNuevo.addEventListener("click", () => {
        const nombre = prompt("Nombre del nuevo guardarropa:");

        if (nombre && nombre.trim() !== "") {
            let guardarropas = JSON.parse(localStorage.getItem("guardarropas")) || [];

            guardarropas.push({
                nombre,
                prendas: []
            });

            localStorage.setItem("guardarropas", JSON.stringify(guardarropas));
            cargarGuardarropas();
        }
    });

    // Delegación de eventos
    lista.addEventListener("click", (e) => {
        let guardarropas = JSON.parse(localStorage.getItem("guardarropas")) || [];

        // ➕ Agregar prendas dentro del guardarropa
        if (e.target.dataset.ver) {
            const index = e.target.dataset.ver;
            localStorage.setItem("guardarropaSeleccionado", index);
            window.location.href = "dentrodelguarda.html";
        }

        // ❌ Eliminar
        if (e.target.dataset.eliminar) {
            const index = e.target.dataset.eliminar;
            guardarropas.splice(index, 1);
            localStorage.setItem("guardarropas", JSON.stringify(guardarropas));
            cargarGuardarropas();
        }

        // Entrar al guardarropa haciendo clic en el nombre
        if (e.target.classList.contains("nombre-guardarropa")) {
            const index = e.target.dataset.index;
            localStorage.setItem("guardarropaSeleccionado", index);
            window.location.href = "dentrodelguarda.html";
        }
    });

    cargarGuardarropas();
}



// ==========================================================
// PANTALLA DENTRO DEL GUARDARROPA
// (dentrodelguarda.html)
// ==========================================================

if (window.location.pathname.includes("dentrodelguarda.html")) {

    const listaPrendas = document.getElementById("listaPrendas");
    const btnNuevaPrenda = document.getElementById("btnNuevaPrenda");
    const titulo = document.getElementById("tituloGuardarropa");

    let guardarropas = JSON.parse(localStorage.getItem("guardarropas")) || [];
    let index = localStorage.getItem("guardarropaSeleccionado");

    if (!guardarropas[index]) {
        alert("Error: guardarropa no encontrado.");
        window.location.href = "guardarropas.html";
    }

    titulo.textContent = guardarropas[index].nombre;

    function cargarPrendas() {
        listaPrendas.innerHTML = "";

        guardarropas[index].prendas.forEach((p, i) => {
            const div = document.createElement("div");
            div.className = "item-prenda";

            div.innerHTML = `
                <span>${p}</span>
                <button class="btn-cambiar" data-cambiar="${i}">✏️</button>
            `;

            listaPrendas.appendChild(div);
        });
    }

    btnNuevaPrenda.addEventListener("click", () => {
        const prenda = prompt("Nombre de la prenda:");

        if (prenda && prenda.trim() !== "") {
            guardarropas[index].prendas.push(prenda);
            localStorage.setItem("guardarropas", JSON.stringify(guardarropas));
            cargarPrendas();
        }
    });

    listaPrendas.addEventListener("click", (e) => {
        if (e.target.dataset.cambiar) {
            const i = e.target.dataset.cambiar;
            const nueva = prompt("Nuevo nombre:", guardarropas[index].prendas[i]);

            if (nueva && nueva.trim() !== "") {
                guardarropas[index].prendas[i] = nueva;
                localStorage.setItem("guardarropas", JSON.stringify(guardarropas));
                cargarPrendas();
            }
        }
    });

    cargarPrendas();
}
