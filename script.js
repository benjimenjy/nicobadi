// =====================================================
// LOGIN - index.html
// =====================================================
if (
    window.location.pathname.endsWith("/") ||
    window.location.pathname.includes("index.html")
  ) {
    const btnGoogle = document.getElementById("btnLogin");
    const btnContinuar = document.getElementById("continueBtn");
  
    function login() {
      const nombre = document.getElementById("nombre").value.trim();
      const apellido = document.getElementById("apellido").value.trim();
  
      if (nombre === "" || apellido === "") {
        alert("Por favor completá tu nombre y apellido.");
        return;
      }
  
      localStorage.setItem("usuario", nombre + " " + apellido);
      window.location.href = "guardarropas.html";
    }
  
    // Ambos botones hacen lo mismo por ahora
    btnGoogle.addEventListener("click", login);
    btnContinuar.addEventListener("click", login);
  }
  
  // =====================================================
  // LISTA DE GUARDARROPAS - guardarropas.html
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
              <span class="nombre nombre-click" data-index="${index}">
                  ${g.nombre}
              </span>
  
              <button class="btn-rojo" data-index="${index}">
                  ❌
              </button>
          `;
  
          lista.appendChild(item);
      });
  
      // 👉 ENTRAR AL GUARDARROPA AL TOCAR EL NOMBRE
      document.querySelectorAll(".nombre-click").forEach(nombre => {
          nombre.addEventListener("click", (e) => {
              const id = e.target.dataset.index;
              localStorage.setItem("guardarropaSeleccionado", id);
              window.location.href = "dentrodelguarda.html";
          });
      });
  
      // 👉 BORRAR GUARDARROPA
      document.querySelectorAll(".btn-rojo").forEach(btn => {
          btn.addEventListener("click", (e) => {
              e.stopPropagation(); // evita clicks raros
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
        guardarropas.push({ nombre, prendas: [] });
        localStorage.setItem("guardarropas", JSON.stringify(guardarropas));
        mostrarGuardarropas();
      }
    });
  
    mostrarGuardarropas();
  }
  
 // =====================================================
//  PRENDAS DEL GUARDARROPA - dentrodelguardarropa.html
// =====================================================
if (window.location.pathname.includes("dentrodelguarda.html")) {

    const titulo = document.getElementById("tituloGuardarropa");
    const listaPrendas = document.getElementById("listaPrendas");
    const btnAgregar = document.getElementById("btnAgregarPrenda");
    const btnVolver = document.getElementById("btnVolver");

    let guardarropas = JSON.parse(localStorage.getItem("guardarropas")) || [];
    const id = localStorage.getItem("guardarropaSeleccionado");
    const actual = guardarropas[id];

    titulo.textContent = actual.nombre;

    function mostrarPrendas() {
        listaPrendas.innerHTML = "";

        if (actual.prendas.length === 0) {
            listaPrendas.innerHTML = "<p>No hay prendas aún</p>";
            return;
        }

        actual.prendas.forEach((prenda, index) => {
            const div = document.createElement("div");
            div.className = "prenda";

            div.innerHTML = `
                <span>${prenda}</span>
                <button class="btn-editar" data-index="${index}">✏️</button>
            `;

            listaPrendas.appendChild(div);
        });

        document.querySelectorAll(".btn-editar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const i = e.target.dataset.index;
                const nuevo = prompt("Editar prenda:", actual.prendas[i]);

                if (nuevo) {
                    actual.prendas[i] = nuevo;
                    guardarropas[id] = actual;
                    localStorage.setItem("guardarropas", JSON.stringify(guardarropas));
                    mostrarPrendas();
                }
            });
        });
    }

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
