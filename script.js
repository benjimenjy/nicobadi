let prendas = [];

function agregarPrenda() {
    const nombre = document.getElementById("nombre").value;
    const tipo = document.getElementById("tipo").value;

    if (nombre === "" || tipo === "") {
        alert("Completá todos los campos");
        return;
    }

    prendas.push({ nombre, tipo });
    actualizarLista();

    document.getElementById("nombre").value = "";
    document.getElementById("tipo").value = "";
}

function actualizarLista() {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    prendas.forEach((p) => {
        const item = document.createElement("li");
        item.textContent = `${p.nombre} - ${p.tipo}`;
        lista.appendChild(item);
    });
}
