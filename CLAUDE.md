# Tamehouse — Contexto del proyecto

Tienda online a medida para la venta de merchandising de un cantante (poleras, vinilos, etc.). Primera vez del equipo integrando pasarela de pago, logística y facturación electrónica reales.

## Stack técnico

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (base de datos Postgres, autenticación, storage)
- Hosting: Netlify (rama `main` conectada a producción)
- Pago: Getnet
- Envío: API Chilexpress
- Facturación electrónica: Facto (plan Micro)

## Estructura de carpetas
src/
    app/
        (tienda)/ → Home, catálogo, ficha de producto, carrito, checkout
        (cuenta)/ → Login, registro, mi cuenta
        admin/ → Panel de administración
        api/ → Rutas de integración (Getnet, Chilexpress, webhooks)
        components/ → Componentes reutilizables
        lib/ → Conexión a Supabase, schema.sql, lógica compartida

## División de trabajo

- **Persona A:** todo lo orientado al cliente/fan — Home, catálogo, ficha de producto, carrito, checkout (UI y formulario), cuenta de cliente (Auth, RLS del lado de uso), contenido de artista (bio, shows en el sitio público), páginas legales.
- **Persona B:** todo el panel de administración, integraciones (Getnet, Chilexpress, facturación), notificaciones, y seguridad backend (rate limiting, manejo de variables de entorno, verificación de webhooks).
- **Punto de cruce:** el checkout — Persona A hace el formulario y la lógica de carrito, Persona B conecta el pago real con Getnet. Revisar el Pull Request del otro con más atención en esta parte.

## Reglas de Git — SIEMPRE seguir esto

- **Nunca trabajar directo sobre `main` ni `dev`.** Cada tarea va en su propia rama.
- Flujo para cada tarea nueva:
```bash
  git checkout dev
  git pull origin dev
  git checkout -b feature/nombre-de-la-tarea
```
- Nombrar las ramas según la tarea: `feature/home`, `feature/checkout-getnet`, `feature/panel-pedidos`, etc.
- Commits chicos y frecuentes, con mensajes claros en formato `tipo: descripción` (ej: `feat: agrega selector de talla en ficha de producto`, `fix: corrige cálculo de envío`).
- Al terminar una tarea:
```bash
  git push -u origin feature/nombre-de-la-tarea
```
  y abrir un Pull Request hacia `dev` en GitHub (nunca hacia `main` directamente).
- `main` solo recibe código desde `dev`, cuando un bloque de funcionalidad está probado y estable.
- Nunca hacer `git push --force` a `dev` ni a `main`.
- Las claves (Supabase, Getnet, Chilexpress) van siempre en `.env.local`, nunca en el código. Si se necesita una variable nueva, agregarla también a `.env.example` (sin el valor real) para que el otro sepa que existe.

## Reglas de código

- TypeScript en todo el proyecto, evitar `any` salvo que sea estrictamente necesario.
- Seguir la estructura de carpetas ya definida — no crear carpetas nuevas en `src/app/` sin coordinarlo con el otro.
- Componentes reutilizables van en `src/components/`, lógica compartida (conexión a Supabase, helpers) en `src/lib/`.
- Antes de tocar la base de datos (crear tablas, cambiar columnas), actualizar `src/lib/schema.sql` con el cambio, para que quede documentado y el otro lo pueda replicar en su propio Supabase si hiciera falta.
- Las consultas a Supabase deben pedir explícitamente las columnas necesarias (`select('id, nombre, precio')`), no usar `select('*')` sin necesidad — reduce consumo de bandwidth.
- Optimizar imágenes antes de subirlas (WebP, comprimidas, tamaño real de uso) y usar `next/image` para servirlas.
- Cualquier dato sensible para envío (peso, dimensiones de producto) se pide en el formulario de producto pero no se muestra en el frontend público — es responsabilidad del componente, no de la base de datos, ocultarlo.

## Seguridad — no negociable

- Nunca guardar datos de tarjeta de crédito/débito en la base de datos — eso lo procesa Getnet directamente.
- Toda tabla nueva en Supabase debe tener Row Level Security activado y políticas explícitas antes de usarse.
- Verificar la firma de cualquier webhook (Getnet) antes de confiar en su contenido.
- Validar todo dato que venga de un formulario antes de guardarlo o procesarlo.

## Cuando tengas dudas

Si una tarea no está clara, o si vas a tomar una decisión que afecta al otro (por ejemplo, cambiar el modelo de datos, agregar una librería nueva grande, cambiar la estructura de carpetas), avisar antes de hacerlo, no solo documentarlo después.