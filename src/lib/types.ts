export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string | null;
  activo: boolean;
  alto_cm: number | null;
  ancho_cm: number | null;
  largo_cm: number | null;
  peso_kg: number | null;
  precio_oferta: number | null;
  oferta_hasta: string | null;
  oferta_tipo: "porcentaje" | "monto_fijo" | null;
  oferta_valor: number | null;
  created_at: string;
}

export interface CodigoDescuento {
  id: string;
  codigo: string;
  tipo: "porcentaje" | "monto_fijo";
  valor: number;
  permite_con_oferta: boolean;
  monto_minimo: number | null;
  tope_maximo: number | null;
  usos_maximos: number | null;
  usos_actuales: number;
  usuarios_maximos: number | null;
  vigente_hasta: string | null;
  activo: boolean;
  created_at: string;
}

export interface MedidaItem {
  etiqueta: string;
  valor: string;
}

export interface Variante {
  id: string;
  producto_id: string;
  talla: string | null;
  color: string | null;
  stock: number;
  medidas: MedidaItem[];
  created_at: string;
}

export interface ProductoListado {
  id: string;
  nombre: string;
  precio: number;
  precioOferta: number | null;
  ofertaHasta: string | null;
  ofertaTipo: "porcentaje" | "monto_fijo" | null;
  ofertaValor: number | null;
  categoria: string | null;
  activo: boolean;
  stockTotal: number;
  tieneTallaSinStock: boolean;
  imagenUrl: string | null;
}

export interface FilaTalla {
  id: string | null;
  talla: string;
  stock: string;
  medidas: MedidaItem[];
}

export interface ProductoImagen {
  id: string;
  producto_id: string;
  url: string;
  orden: number;
  created_at: string;
}

export type EstadoPedido = "pagado" | "preparando" | "despachado" | "entregado";

export interface Pedido {
  id: string;
  cliente_id: string | null;
  estado: EstadoPedido;
  total: number;
  direccion: string | null;
  comuna: string | null;
  comuna_code: string | null;
  calle: string | null;
  numero: string | null;
  depto: string | null;
  destinatario_nombre: string | null;
  destinatario_telefono: string | null;
  destinatario_email: string | null;
  servicio_type_code: number | null;
  retiro_oficina_code: number | null;
  retiro_oficina_nombre: string | null;
  numero_seguimiento: string | null;
  codigo_descuento: string | null;
  descuento_aplicado: number;
  created_at: string;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  variante_id: string | null;
  cantidad: number;
  precio_unitario: number;
}

export interface PedidoListado extends Pedido {
  itemsCount: number;
  clienteNombre: string | null;
}
