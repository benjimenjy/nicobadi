// =====================================================
//  LOGIN - index.html
// =====================================================
if (
    window.location.pathname.endsWith("/") ||
    window.location.pathname.includes("index.html")
  ) {
    const btnContinuar = document.getElementById("continueBtn");
  
    btnContinuar.addEventListener("click", () => {
      const nombre = document.getElementById("nombre").value.trim();
      const apellido = document.getElementById("apellido").value.trim();
  
      if (nombre === "" || apellido === "") {
        alert("Por favor completá tu nombre y apellido.");
        return;
      }
  
      // Simulamos login
      localStorage.setItem("usuario", nombre + " " + apellido);
  
      // Ir a la siguiente pantalla
      window.location.href = "guardarropas.html";
    });
  }
  

// =====================================================
//  LISTA DE GUARDARROPAS - guardarropas.html
// =====================================================
if (window.location.pathname.includes("guardarropas.html")) {

    const lista = document.getElementById("listaGuardarropas");
    const btnNuevo = document.getElementById("btnNuevoGuardarropa");

    let guardarropas = JSON.parse(localStorage.getItem("guardarropas")) || [];

    function mostrarGuardarropas() {
        lista.innerHTML = "";

        guardarropas.forEach((g, index) => {
            const item = document.createElement("div");
            item.className = "item";

            item.innerHTML = `
                <span class="nombre">${g.nombre}</span>

                <button class="btn-verde" data-index="${index}">
                    ➕
                </button>

                <button class="btn-rojo" data-index="${index}">
                    ❌
                </button>
            `;

            lista.appendChild(item);
        });

        // BOTÓN PARA ENTRAR
        document.querySelectorAll(".btn-verde").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.dataset.index;
                localStorage.setItem("guardarropaSeleccionado", id);
                window.location.href = "dentrodelguarda.html";
            });
        });

        // BOTÓN PARA BORRAR
        document.querySelectorAll(".btn-rojo").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.dataset.index;
                guardarropas.splice(id, 1);
                localStorage.setItem("guardarropas", JSON.stringify(guardarropas));
                mostrarGuardarropas();
            });
        });
    }

    btnNuevo.addEventListener("click", () => {
        const nombre = prompt("Nombre del nuevo guardarropa:");
        if (nombre) {
            guardarropas.push({ nombre: nombre, prendas: [] });
            localStorage.setItem("guardarropas", JSON.stringify(guardarropas));
            mostrarGuardarropas();
        }
    });

    mostrarGuardarropas();
}

// =====================================================
//  PRENDAS DEL GUARDARROPAS - dentrodelguarda.html
// =====================================================
if (window.location.pathname.includes("dentrodelguarda.html")) {

    const titulo = document.getElementById("tituloGuardarropa");
    const listaPrendas = document.getElementById("listaPrendas");
    const btnAgregar = document.getElementById("btnAgregarPrenda");
    const btnVolver = document.getElementById("btnVolver");

    let guardarropas = JSON.parse(localStorage.getItem("guardarropas")) || [];
    const id = localStorage.getItem("guardarropaSeleccionado");
    const actual = guardarropas[id];

    // Mostrar título
    titulo.textContent = actual.nombre;

    function mostrarPrendas() {
        listaPrendas.innerHTML = "";

        actual.prendas.forEach((p, index) => {
            const item = document.createElement("div");
            item.className = "prenda";

            item.innerHTML = `
                <input class="input-prenda" value="${p}" data-index="${index}" />

                <button class="btn-gris" data-index="${index}">
                    ✏️
                </button>
            `;

            listaPrendas.appendChild(item);
        });

        // Evento cambiar nombre
        document.querySelectorAll(".btn-gris").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                const nuevo = prompt("Nuevo nombre de la prenda:", actual.prendas[index]);
                if (nuevo) {
                    actual.prendas[index] = nuevo;
                    guardarropas[id] = actual;
                    localStorage.setItem("guardarropas", JSON.stringify(guardarropas));
                    mostrarPrendas();
                }
            });
        });
    }

    // Agregar prenda nueva
    btnAgregar.addEventListener("click", () => {
        const nueva = prompt("Nombre de la prenda:");
        if (nueva) {
            actual.prendas.push(nueva);
            guardarropas[id] = actual;
            localStorage.setItem("guardarropas", JSON.stringify(guardarropas));
            mostrarPrendas();
        }
    });

    btnVolver.addEventListener("click", () => {
        window.location.href = "guardarropas.html";
    });

    mostrarPrendas();
}
