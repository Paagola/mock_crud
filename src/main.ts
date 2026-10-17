import { asyncWrapProviders } from "async_hooks";
import * as readline from "node:readline/promises";

// variables principales para leer y mostrar datos por consola y para hacer peticiones a un servidor json
const url = "http://localhost:3000"; // el servidor json corriendo
const rl = readline.createInterface({ // Variable para pedir datos por consola y mostrar datos por consola
    input: process.stdin,
    output: process.stdout
});
const linea = "--------------------------------------------------"; // Variable para separar datos en consola   

// Funcion para mostrar todos los datos del cliente en formato JSON
async function mostrarDatosClientes() {
    const res = await fetch(url+"/clientes");
    const datos = await res.json();
    console.log(datos);
}

// Funcion para mostrar todos los datos del pedido en formato JSON
async function mostrarDatosPedidos() {
    const res = await fetch(url+"/pedidos");
    const datos = await res.json();
    console.log(datos)
}

async function buscadorCliente(): Promise<void> {
    console.log("Ingrese el ID del cliente que desea buscar: ");
    const idCliente = await rl.question("ID de cliente: "); // Se le pide al usuario buscar un cliente
    const client = await fetch(`${url}/clientes/${idCliente}`); // se busca el cliente que ha seleccionado el usuario
    if (client.ok) { // se revisa que el cliente exista.
        const datosCliente = await client.json(); 
        console.log(datosCliente); // si existen se imprimer en formato JSON.
    } else {
        console.log("Cliente no encontrado");
    }
}


async function mostrarPedidosFiltrados() {
    const importe = await rl.question("Importe mínimo de pedido:");
    const res = await fetch(`${url}/pedidos?importe_gte=${importe}`);
    const datos = await res.json();
    console.log(datos);
}

// Funcion mostrar menu, pide una promesa en formato de número.
async function mostrarMenu(): Promise<number> {
    console.log("1. Mostrar datos de clientes");
    console.log("2. Mostrar datos de pedidos");
    console.log("3. Buscar cliente por ID");
    console.log("4. Filtrar pedidos por importe");
    console.log("5. Salir");
    return Number(await rl.question("Seleccione una opción: "));
}


async function main(): Promise<number> {
    switch (await mostrarMenu()) {
        case 1:
            await mostrarDatosClientes();
            console.log(linea);
            return 1;
            break;
        case 2:
            await mostrarDatosPedidos();
            console.log(linea);
            return 2;
            break;
        case 3:
            await buscadorCliente();
            console.log(linea);
            return 3;
        case 4:
            await mostrarPedidosFiltrados();
            console.log(linea);
            return 4;
        case 5:
            console.log("Saliendo...");
            return 5;
        default:
            console.log("Opción no válida");
            console.log(linea);
            return 0;
    }
}

while (true) {
    if (await main() === 5) {
        break; // si el usuario selecciona el 5, saldrá del bucle y terminará el programa.
    }
    await main();
}