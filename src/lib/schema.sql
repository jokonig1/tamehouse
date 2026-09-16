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

-- Datos de despacho del pedido, capturados en el checkout. Van
-- aparte de direccion/comuna (que son el texto legible que se
-- muestra en el panel) porque Chilexpress necesita el código de
-- cobertura de la comuna y la calle/número por separado, no un
-- solo texto libre. servicio_type_code es el código de servicio de
-- Chilexpress a usar (elegido por el cliente en envío a domicilio,
-- o el más barato disponible en retiro en sucursal).
alter table pedidos
  add column comuna_code text,
  add column calle text,
  add column numero text,
  add column depto text,
  add column destinatario_nombre text,
  add column destinatario_telefono text,
  add column destinatario_email text,
  add column servicio_type_code integer,
  add column retiro_oficina_code integer,
  add column retiro_oficina_nombre text;

-- Etiqueta de envío (imagen JPEG en base64) que devuelve Chilexpress
-- al generar el envío. Se guarda para poder reimprimirla desde el
-- panel sin tener que generar el envío de nuevo.
alter table pedidos
  add column etiqueta_chilexpress text;

-- Tabla de items dentro de cada pedido
create table pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id) on delete cascade,
  variante_id uuid references variantes(id),
  cantidad integer not null,
  precio_unitario integer not null
);

-- Tabla de perfiles (datos de usuario que no son de auth)
-- 1 a 1 con auth.users. rol distingue clientes de admins;
-- tambien sirve a futuro para historial de pedidos, datos
-- de contacto, etc. del lado cliente.
create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  rol text not null default 'cliente', -- 'cliente' | 'admin'
  nombre text,
  telefono text,
  created_at timestamp with time zone default now()
);

-- Tabla de imagenes de producto (una o mas por producto)
-- Los archivos en si viven en Supabase Storage, bucket "productos";
-- aqui solo se guarda la URL publica y el orden de despliegue.
create table producto_imagenes (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id) on delete cascade,
  url text not null,
  orden integer not null default 0,
  created_at timestamp with time zone default now()
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

-- Configuración de música (enlaces de Spotify/YouTube que se
-- muestran en la página pública de música). Fila única, id siempre 1.
create table configuracion_musica (
  id integer primary key default 1,
  spotify_url text,
  youtube_url text,
  updated_at timestamp with time zone default now(),
  constraint configuracion_musica_fila_unica check (id = 1)
);

insert into configuracion_musica (id) values (1);

-- Registro de intentos de login (para rate limiting). Se escribe y
-- lee solo desde el server (service role) en /api/auth/login, nunca
-- desde el cliente -- por eso no tiene ninguna policy: RLS activado
-- sin excepciones bloquea a anon/authenticated por completo.
create table intentos_login (
  id bigint generated always as identity primary key,
  email text not null,
  ip text,
  exitoso boolean not null,
  creado_en timestamp with time zone default now()
);

create index intentos_login_email_creado_en_idx on intentos_login (email, creado_en);
create index intentos_login_ip_creado_en_idx on intentos_login (ip, creado_en);

-- Imagenes del hero de la home (una fila = una imagen, en orden).
-- Con una sola fila se ve como imagen unica; con varias, como
-- carrusel -- el frontend decide como mostrarlas, no la tabla.
-- Los archivos viven en Supabase Storage, bucket "hero".
create table hero_slides (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  logo_oscuro boolean not null default false,
  orden integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Título y subtítulo que se muestran sobre la portada de la home.
-- Fila única, id siempre 1, sembrada con el texto actual. Pueden
-- quedar en null si se prefiere no mostrar título/subtítulo.
create table configuracion_hero (
  id integer primary key default 1,
  titulo text default 'Aerstame',
  subtitulo text default 'Merchandising oficial',
  updated_at timestamp with time zone default now(),
  constraint configuracion_hero_fila_unica check (id = 1)
);

insert into configuracion_hero (id) values (1);

-- ============================================
-- PERMISOS (ROW LEVEL SECURITY)
-- ============================================

alter table productos enable row level security;
alter table variantes enable row level security;
alter table producto_imagenes enable row level security;
alter table pedidos enable row level security;
alter table pedido_items enable row level security;
alter table shows enable row level security;
alter table configuracion_musica enable row level security;
alter table intentos_login enable row level security;
alter table hero_slides enable row level security;
alter table configuracion_hero enable row level security;

-- Productos: lectura pública
create policy "Productos visibles para todos"
on productos for select
using (true);

-- Variantes: lectura pública
create policy "Variantes visibles para todos"
on variantes for select
using (true);

-- Imagenes de producto: lectura pública
create policy "Imagenes de productos visibles para todos"
on producto_imagenes for select
using (true);

-- Shows: lectura pública
create policy "Shows visibles para todos"
on shows for select
using (true);

-- Configuracion musica: lectura pública
create policy "Configuracion musica visible para todos"
on configuracion_musica for select
using (true);

-- Hero slides: lectura pública
create policy "Hero slides visibles para todos"
on hero_slides for select
using (true);

-- Configuracion hero: lectura pública
create policy "Configuracion hero visible para todos"
on configuracion_hero for select
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

-- Perfiles: cada usuario ve y actualiza el suyo.
-- El rol queda protegido por el grant de columnas de abajo,
-- para que un cliente no pueda autoasignarse admin.
alter table perfiles enable row level security;

create policy "Usuarios ven su propio perfil"
on perfiles for select
using (auth.uid() = id);

create policy "Usuarios actualizan su propio perfil"
on perfiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

revoke update on perfiles from authenticated;
grant update (nombre, telefono) on perfiles to authenticated;

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Chequea si el usuario autenticado es admin. security definer
-- para que pueda leer perfiles saltandose RLS (evita recursion
-- cuando otras tablas usan esta funcion en sus propias policies).
create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from perfiles where id = auth.uid() and rol = 'admin'
  );
$$;

-- Crea automaticamente la fila de perfil (rol 'cliente') cuando
-- alguien se registra. El cliente nunca inserta su propio perfil
-- ni elige su rol. Nombre y telefono se copian desde la metadata
-- que manda signUp (options.data), porque en ese momento el
-- usuario todavia puede no tener sesion activa (si el proyecto
-- pide confirmar el correo) y no podria hacer un update via RLS.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, rol, nombre, telefono)
  values (
    new.id,
    'cliente',
    new.raw_user_meta_data ->> 'nombre',
    new.raw_user_meta_data ->> 'telefono'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Crea un pedido completo (fila de pedidos + pedido_items + descuento
-- de stock) en un solo paso atomico. security definer porque el
-- cliente que compra no tiene permiso para editar variantes.stock
-- directo (esa regla es a proposito, para que nadie pueda escribir
-- cualquier valor ahi) -- esta funcion es la unica puerta angosta que
-- le permite restar stock, y solo si alcanza. Si algun item no tiene
-- stock suficiente, lanza una excepcion y Postgres deshace todo lo
-- que la funcion haya insertado en esa misma llamada (no queda ni el
-- pedido ni ningun item a medias).
-- p_items: jsonb con forma [{"varianteId": uuid, "cantidad": int, "precioUnitario": int}, ...]
create function public.crear_pedido(
  p_total integer,
  p_direccion text,
  p_comuna text,
  p_comuna_code text,
  p_calle text,
  p_numero text,
  p_depto text,
  p_destinatario_nombre text,
  p_destinatario_telefono text,
  p_destinatario_email text,
  p_servicio_type_code integer,
  p_retiro_oficina_code integer,
  p_retiro_oficina_nombre text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido_id uuid;
  v_item jsonb;
  v_variante_id uuid;
  v_cantidad integer;
  v_precio_unitario integer;
  v_nombre_producto text;
  v_talla text;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión para comprar.';
  end if;

  insert into pedidos (
    cliente_id, estado, total, direccion, comuna, comuna_code, calle, numero, depto,
    destinatario_nombre, destinatario_telefono, destinatario_email,
    servicio_type_code, retiro_oficina_code, retiro_oficina_nombre
  ) values (
    auth.uid(), 'pagado', p_total, p_direccion, p_comuna, p_comuna_code, p_calle, p_numero, p_depto,
    p_destinatario_nombre, p_destinatario_telefono, p_destinatario_email,
    p_servicio_type_code, p_retiro_oficina_code, p_retiro_oficina_nombre
  )
  returning id into v_pedido_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_variante_id := (v_item ->> 'varianteId')::uuid;
    v_cantidad := (v_item ->> 'cantidad')::integer;
    v_precio_unitario := (v_item ->> 'precioUnitario')::integer;

    update variantes
    set stock = stock - v_cantidad
    where id = v_variante_id and stock >= v_cantidad;

    if not found then
      select p.nombre, va.talla into v_nombre_producto, v_talla
      from variantes va join productos p on p.id = va.producto_id
      where va.id = v_variante_id;

      raise exception 'Sin stock suficiente de % (talla %).',
        coalesce(v_nombre_producto, 'producto'), coalesce(v_talla, '-');
    end if;

    insert into pedido_items (pedido_id, variante_id, cantidad, precio_unitario)
    values (v_pedido_id, v_variante_id, v_cantidad, v_precio_unitario);
  end loop;

  return v_pedido_id;
end;
$$;

revoke execute on function public.crear_pedido(
  integer, text, text, text, text, text, text, text, text, text, integer, integer, text, jsonb
) from public;

grant execute on function public.crear_pedido(
  integer, text, text, text, text, text, text, text, text, text, integer, integer, text, jsonb
) to authenticated;

-- ============================================
-- PERMISOS ADMIN (panel de administracion)
-- ============================================

-- Productos: solo admin crea/edita/elimina
create policy "Admins escriben productos"
on productos for insert
with check (public.is_admin());

create policy "Admins editan productos"
on productos for update
using (public.is_admin());

create policy "Admins eliminan productos"
on productos for delete
using (public.is_admin());

-- Variantes: solo admin escribe (lectura ya es publica)
create policy "Admins escriben variantes"
on variantes for insert
with check (public.is_admin());

create policy "Admins editan variantes"
on variantes for update
using (public.is_admin());

create policy "Admins eliminan variantes"
on variantes for delete
using (public.is_admin());

-- Imagenes de producto: solo admin escribe (lectura ya es publica)
create policy "Admins escriben imagenes de productos"
on producto_imagenes for insert
with check (public.is_admin());

create policy "Admins eliminan imagenes de productos"
on producto_imagenes for delete
using (public.is_admin());

-- Perfiles: admin ve todos (para mostrar el nombre del cliente en
-- el panel de pedidos -- sin esto, RLS le esconde al admin el perfil
-- de cualquiera que no sea el mismo, y el nombre nunca aparece)
create policy "Admins ven todos los perfiles"
on perfiles for select
using (public.is_admin());

-- Pedidos: admin ve todos y actualiza estado/seguimiento
create policy "Admins ven todos los pedidos"
on pedidos for select
using (public.is_admin());

create policy "Admins actualizan pedidos"
on pedidos for update
using (public.is_admin());

-- Pedido items: admin ve todos
create policy "Admins ven todos los items"
on pedido_items for select
using (public.is_admin());

-- Shows: solo admin crea/edita/elimina (lectura ya es publica)
create policy "Admins escriben shows"
on shows for insert
with check (public.is_admin());

create policy "Admins editan shows"
on shows for update
using (public.is_admin());

create policy "Admins eliminan shows"
on shows for delete
using (public.is_admin());

-- Configuracion musica: solo admin actualiza (fila unica, ya sembrada)
create policy "Admins actualizan configuracion musica"
on configuracion_musica for update
using (public.is_admin());

-- Hero slides: solo admin crea/edita/elimina (lectura ya es publica)
create policy "Admins escriben hero slides"
on hero_slides for insert
with check (public.is_admin());

create policy "Admins editan hero slides"
on hero_slides for update
using (public.is_admin());

create policy "Admins eliminan hero slides"
on hero_slides for delete
using (public.is_admin());

-- Configuracion hero: solo admin actualiza (fila unica, ya sembrada)
create policy "Admins actualizan configuracion hero"
on configuracion_hero for update
using (public.is_admin());

-- ============================================
-- STORAGE (Supabase Storage)
-- ============================================

-- Bucket publico para fotos de producto. La URL publica de cada
-- archivo queda registrada en producto_imagenes.url
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

create policy "Imagenes de productos visibles para todos (storage)"
on storage.objects for select
using (bucket_id = 'productos');

create policy "Admins suben imagenes de productos (storage)"
on storage.objects for insert
with check (bucket_id = 'productos' and public.is_admin());

create policy "Admins eliminan imagenes de productos (storage)"
on storage.objects for delete
using (bucket_id = 'productos' and public.is_admin());

-- Bucket publico para las imagenes del hero. La URL publica de cada
-- archivo queda registrada en hero_slides.url
insert into storage.buckets (id, name, public)
values ('hero', 'hero', true)
on conflict (id) do nothing;

create policy "Imagenes de hero visibles para todos (storage)"
on storage.objects for select
using (bucket_id = 'hero');

create policy "Admins suben imagenes de hero (storage)"
on storage.objects for insert
with check (bucket_id = 'hero' and public.is_admin());

create policy "Admins eliminan imagenes de hero (storage)"
on storage.objects for delete
using (bucket_id = 'hero' and public.is_admin());