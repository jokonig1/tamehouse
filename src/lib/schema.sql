-- ============================================
-- ESQUEMA DE BASE DE DATOS - TAMEHOUSE
-- Este archivo documenta las tablas y permisos
-- creados en Supabase. Si se necesita recrear
-- la base de datos desde cero, ejecutar estas
-- consultas en el SQL Editor de Supabase, en orden.
-- ============================================

-- ============================================
-- TABLAS
-- ============================================

-- Tabla de productos
create table productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  precio integer not null,
  categoria text,
  activo boolean default true,
  created_at timestamp with time zone default now()
);

-- Datos de envío del producto (peso y dimensiones)
-- No se muestran en el sitio público, solo se usan
-- internamente para calcular costo de envío
alter table productos
  add column alto_cm numeric,
  add column ancho_cm numeric,
  add column largo_cm numeric,
  add column peso_kg numeric;

-- Tabla de variantes (talla/color) de cada producto
create table variantes (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id) on delete cascade,
  talla text,
  color text,
  stock integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Tabla de pedidos
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references auth.users(id),
  estado text not null default 'pagado', -- pagado, preparando, despachado, entregado
  total integer not null,
  direccion text,
  comuna text,
  numero_seguimiento text,
  created_at timestamp with time zone default now()
);

-- Tabla de items dentro de cada pedido
create table pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id) on delete cascade,
  variante_id uuid references variantes(id),
  cantidad integer not null,
  precio_unitario integer not null
);

-- Tabla de shows
create table shows (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  ciudad text not null,
  lugar text,
  link_entradas text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- PERMISOS (ROW LEVEL SECURITY)
-- ============================================

-- Productos: lectura pública
create policy "Productos visibles para todos"
on productos for select
using (true);

-- Variantes: lectura pública
create policy "Variantes visibles para todos"
on variantes for select
using (true);

-- Shows: lectura pública
create policy "Shows visibles para todos"
on shows for select
using (true);

-- Pedidos: cada cliente solo ve y crea los suyos
create policy "Clientes ven sus propios pedidos"
on pedidos for select
using (auth.uid() = cliente_id);

create policy "Clientes crean sus propios pedidos"
on pedidos for insert
with check (auth.uid() = cliente_id);

-- Pedido items: solo visibles si el pedido es del cliente
create policy "Items visibles si el pedido es propio"
on pedido_items for select
using (
  exists (
    select 1 from pedidos
    where pedidos.id = pedido_items.pedido_id
    and pedidos.cliente_id = auth.uid()
  )
);

create policy "Items creables si el pedido es propio"
on pedido_items for insert
with check (
  exists (
    select 1 from pedidos
    where pedidos.id = pedido_items.pedido_id
    and pedidos.cliente_id = auth.uid()
  )
);