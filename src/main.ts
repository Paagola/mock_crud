import { asyncWrapProviders } from "async_hooks";
import * as readline from "node:readline/promises";

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

const cabecera = "Elija una opcion\n1. Mostrar todos los Clientes\n2. Mostrar todos los pedidos";




mostrarDatosClientes();

mostrarDatosPedidos();

