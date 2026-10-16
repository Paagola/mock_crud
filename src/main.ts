const url = "http://localhost:3000/clientes"; // el servidor json corriendo

async function mostrarDatos() {
    const res = await fetch(url);
    const datos = await res.json();
    console.log(datos);
}

mostrarDatos();