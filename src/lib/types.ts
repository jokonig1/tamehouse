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
  created_at: string;
}

export interface Variante {
  id: string;
  producto_id: string;
  talla: string | null;
  color: string | null;
  stock: number;
  created_at: string;
}

export interface ProductoListado {
  id: string;
  nombre: string;
  precio: number;
  categoria: string | null;
  activo: boolean;
  stockTotal: number;
}

export interface FilaTalla {
  id: string | null;
  talla: string;
  stock: string;
}

export interface ProductoImagen {
  id: string;
  producto_id: string;
  url: string;
  orden: number;
  created_at: string;
}
