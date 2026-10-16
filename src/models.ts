// Tabla "1": un cliente tiene muchos pedidos.
export interface Cliente {
  id: number;
  nombre: string;
  ciudad: string;
}

// Tabla "M": cada pedido pertenece a un cliente (clave foránea clienteId).
export interface Pedido {
  id: number;
  producto: string;
  importe: number;
  clienteId: number;
}

export type Nuevo<T extends { id: number }> = Omit<T, "id">;

export type ClienteConPedidos = Cliente & { pedidos: Pedido[] };
export type PedidoConCliente = Pedido & { cliente: Cliente };
