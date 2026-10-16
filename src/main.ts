import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  clientes, pedidos, clientesConPedidos, pedidosConCliente,
  pedidosDeCliente, crearPedido, eliminarClienteEnCascada,
} from "./api.js";

const rl = createInterface({ input, output });
const preguntar = (t: string) => rl.question(t);
const numero = async (t: string) => Number(await preguntar(t));

// ---------- Vistas ----------
async function verClientesConPedidos() {
  for (const a of await clientesConPedidos()) {
    console.log(`\n#${a.id} ${a.nombre} (${a.ciudad}) — ${a.pedidos.length} pedido(s)`);
    a.pedidos.forEach((l) => console.log(`   └─ #${l.id} ${l.producto} (${l.importe})`));
  }
}

async function verPedidosConCliente() {
  console.table(
    (await pedidosConCliente()).map((l) => ({
      id: l.id, producto: l.producto, importe: l.importe, cliente: l.cliente.nombre,
    })),
  );
}

// ---------- Acciones interactivas ----------
const acciones: Record<string, () => Promise<void>> = {
  "1": async () => console.table(await clientes.listar()),
  "2": async () => console.table(await pedidos.listar()),
  "3": verClientesConPedidos,
  "4": verPedidosConCliente,
  "5": async () => {
    const a = await clientes.crear({
      nombre: await preguntar("Nombre: "),
      ciudad: await preguntar("Ciudad: "),
    });
    console.log("Cliente creado:", a);
  },
  "6": async () => {
    const l = await crearPedido({
      producto: await preguntar("Producto: "),
      importe: await numero("Importe (€): "),
      clienteId: await numero("ID del cliente: "),
    });
    console.log("Pedido creado:", l);
  },
  "7": async () => {
    const id = await numero("ID del cliente: ");
    const nombre = await preguntar("Nuevo nombre (vacío = no cambiar): ");
    const ciudad = await preguntar("Nueva ciudad (vacío = no cambiar): ");
    const cambios = { ...(nombre && { nombre }), ...(ciudad && { ciudad }) };
    console.log("Cliente actualizado:", await clientes.actualizar(id, cambios));
  },
  "8": async () => {
    const id = await numero("ID del pedido: ");
    const producto = await preguntar("Nuevo producto (vacío = no cambiar): ");
    const importe = await preguntar("Nuevo importe (vacío = no cambiar): ");
    const clienteId = await preguntar("Nuevo ID de cliente (vacío = no cambiar): ");
    const cambios = {
      ...(producto && { producto }),
      ...(importe && { importe: Number(importe) }),
      ...(clienteId && { clienteId: Number(clienteId) }),
    };
    console.log("Pedido actualizado:", await pedidos.actualizar(id, cambios));
  },
  "9": async () => {
    await pedidos.eliminar(await numero("ID del pedido a eliminar: "));
    console.log("Pedido eliminado.");
  },
  "10": async () => {
    const id = await numero("ID del cliente a eliminar: ");
    const n = await eliminarClienteEnCascada(id);
    console.log(`Cliente eliminado junto con ${n} pedido(s).`);
  },
  "11": async () => {
    const id = await numero("ID del cliente: ");
    console.table(await pedidosDeCliente(id));
  },
};

const MENU = `
=========== CRUD Clientes (1) → Pedidos (M) ===========
 1. Listar clientes            7. Modificar cliente (PATCH)
 2. Listar pedidos             8. Modificar pedido (PATCH)
 3. Clientes con sus pedidos    9. Eliminar pedido
 4. Pedidos con su cliente      10. Eliminar cliente (cascada)
 5. Crear cliente              11. Pedidos de un cliente
 6. Crear pedido               0. Salir
=====================================================`;

async function menu() {
  while (true) {
    console.log(MENU);
    const op = (await preguntar("Opción: ")).trim();
    if (op === "0") break;
    const accion = acciones[op];
    if (!accion) { console.log("Opción no válida."); continue; }
    try { await accion(); } catch (e) { console.error("⚠", (e as Error).message); }
  }
  rl.close();
}

// ---------- Demo automática (sin interacción) ----------
async function demo() {
  rl.close();
  console.log("── READ ──");
  await verClientesConPedidos();

  console.log("\n── CREATE ──");
  const cliente = await clientes.crear({ nombre: "Lucía Torres", ciudad: "Cádiz" });
  const pedido = await crearPedido({ producto: "Teclado mecánico", importe: 89.9, clienteId: cliente.id });
  console.log(cliente, pedido);

  console.log("\n── UPDATE ──");
  console.log(await pedidos.actualizar(pedido.id, { producto: "Teclado mecánico RGB" }));
  console.log(await clientes.reemplazar(cliente.id, { nombre: "Lucía Torres", ciudad: "Sevilla" }));

  console.log("\n── Integridad: pedido con cliente inexistente ──");
  try { await crearPedido({ producto: "Pedido huérfano", importe: 10, clienteId: 999 }); }
  catch (e) { console.log("Rechazado:", (e as Error).message); }

  console.log("\n── DELETE (cascada) ──");
  console.log(`Pedidos borrados con el cliente: ${await eliminarClienteEnCascada(cliente.id)}`);

  console.log("\n── Estado final ──");
  await verPedidosConCliente();
}

(process.argv.includes("--demo") ? demo() : menu()).catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
