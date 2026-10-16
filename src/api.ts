import type { Cliente, ClienteConPedidos, Pedido, PedidoConCliente, Nuevo } from "./models.js";

const BASE_URL = process.env.API_URL ?? "http://localhost:3000";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new Error(`No se pudo conectar con ${BASE_URL}. ¿Está arrancado json-server? (npm run api)`);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} en ${init.method ?? "GET"} ${path}`);
  }
  return (await res.json()) as T;
}

/** Repositorio CRUD genérico: una instancia por recurso (tabla). */
class Repositorio<T extends { id: number }> {
  constructor(private readonly recurso: string) {}

  listar(query = ""): Promise<T[]> {
    return request<T[]>(`/${this.recurso}${query}`);
  }
  obtener(id: number): Promise<T> {
    return request<T>(`/${this.recurso}/${id}`);
  }
  crear(datos: Nuevo<T>): Promise<T> {
    return request<T>(`/${this.recurso}`, { method: "POST", body: JSON.stringify(datos) });
  }
  reemplazar(id: number, datos: Nuevo<T>): Promise<T> {
    return request<T>(`/${this.recurso}/${id}`, { method: "PUT", body: JSON.stringify(datos) });
  }
  actualizar(id: number, parcial: Partial<Nuevo<T>>): Promise<T> {
    return request<T>(`/${this.recurso}/${id}`, { method: "PATCH", body: JSON.stringify(parcial) });
  }
  async eliminar(id: number): Promise<void> {
    await request<unknown>(`/${this.recurso}/${id}`, { method: "DELETE" });
  }
}

export const clientes = new Repositorio<Cliente>("clientes");
export const pedidos = new Repositorio<Pedido>("pedidos");

// ---- Consultas que aprovechan la relación 1:M ----

/** 1 → M: clientes con sus pedidos anidados (_embed). */
export const clientesConPedidos = () => request<ClienteConPedidos[]>("/clientes?_embed=pedidos");

/** M → 1: pedidos con su cliente incluido (_expand). */
export const pedidosConCliente = () => request<PedidoConCliente[]>("/pedidos?_expand=cliente");

/** Ruta anidada: pedidos de un cliente concreto. */
export const pedidosDeCliente = (clienteId: number) => request<Pedido[]>(`/clientes/${clienteId}/pedidos`);

// ---- Reglas de integridad (json-server no las impone) ----

/** Crea un pedido comprobando antes que el cliente exista. */
export async function crearPedido(datos: Nuevo<Pedido>): Promise<Pedido> {
  await clientes.obtener(datos.clienteId); // lanza 404 si no existe
  return pedidos.crear(datos);
}

/** Borra un cliente y, en cascada, todos sus pedidos (evita pedidos huérfanos). */
export async function eliminarClienteEnCascada(id: number): Promise<number> {
  const hijos = await pedidosDeCliente(id);
  await Promise.all(hijos.map((l) => pedidos.eliminar(l.id)));
  await clientes.eliminar(id);
  return hijos.length;
}
