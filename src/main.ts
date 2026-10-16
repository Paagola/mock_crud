import { asyncWrapProviders } from "async_hooks";

const url = "http://localhost:3000"; // el servidor json corriendo

async function mostrarDatosClientes() {
    const res = await fetch(url+"/clientes");
    const datos = await res.json();
    console.log(datos);
}

async function mostrarDatosPedidos() {
    const res = await fetch(url+"/pedidos");
    const datos = await res.json();
    console.log(datos)
}


mostrarDatosClientes();

mostrarDatosPedidos();

