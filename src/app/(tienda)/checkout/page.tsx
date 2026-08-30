"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";

type Region = { regionId: string; regionName: string };
type Comuna = { countyCode: string; countyName: string };
type OpcionEnvio = { servicio: number; descripcion: string; precio: number };
type Oficina = {
  officeCode: number;
  officeName: string;
  comuna: string;
  region: string;
  direccion: string;
};

const formatoPrecio = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

const TARJETAS = ["VISA", "Mastercard", "AMEX", "Diners"];

const inputClass =
  "h-12 w-full rounded-md border border-black/15 bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none focus:border-black/40";

export default function Page() {
  const { items, subtotal, clearCart } = useCart();
  const [entrega, setEntrega] = useState<"envio" | "retiro">("envio");

  const [regiones, setRegiones] = useState<Region[]>([]);

  useEffect(() => {
    fetch("/api/chilexpress/regiones")
      .then((res) => res.json())
      .then((data) => setRegiones(data.regiones ?? []));
  }, []);

  const [region, setRegion] = useState("");
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [cargandoComunas, setCargandoComunas] = useState(false);
  const [comunaCode, setComunaCode] = useState("");
  const [calleEnvio, setCalleEnvio] = useState("");
  const [numeroEnvio, setNumeroEnvio] = useState("");

  const [opcionesEnvio, setOpcionesEnvio] = useState<OpcionEnvio[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<number | null>(null);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  useEffect(() => {
    if (!region) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia la comuna al cambiar de región
      setComunas([]);
      setComunaCode("");
      return;
    }

    setCargandoComunas(true);
    fetch(`/api/chilexpress/comunas?region=${region}`)
      .then((res) => res.json())
      .then((data) => setComunas(data.areas ?? []))
      .finally(() => setCargandoComunas(false));
  }, [region]);

  useEffect(() => {
    if (!comunaCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia la cotización si no hay comuna elegida
      setOpcionesEnvio([]);
      setServicioSeleccionado(null);
      setErrorEnvio(null);
      return;
    }

    setCargandoEnvio(true);
    setErrorEnvio(null);
    fetch("/api/chilexpress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationCountyCode: comunaCode }),
    })
      .then(async (res) => {
        const datos = await res.json();
        if (!res.ok) throw new Error(datos.error ?? "No se pudo cotizar el envío.");
        setOpcionesEnvio(datos.opciones ?? []);
        setServicioSeleccionado(datos.opciones?.[0]?.servicio ?? null);
      })
      .catch((err) => setErrorEnvio(err instanceof Error ? err.message : "No se pudo cotizar el envío."))
      .finally(() => setCargandoEnvio(false));
  }, [comunaCode]);

  const [regionRetiro, setRegionRetiro] = useState("");
  const [comunasRetiro, setComunasRetiro] = useState<Comuna[]>([]);
  const [cargandoComunasRetiro, setCargandoComunasRetiro] = useState(false);
  const [comunaRetiroNombre, setComunaRetiroNombre] = useState("");
  const [comunaRetiroCode, setComunaRetiroCode] = useState("");

  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [oficinaSeleccionada, setOficinaSeleccionada] = useState<number | null>(null);
  const [buscandoOficinas, setBuscandoOficinas] = useState(false);
  const [errorOficinas, setErrorOficinas] = useState<string | null>(null);

  const [costoRetiro, setCostoRetiro] = useState(0);
  const [servicioRetiro, setServicioRetiro] = useState<number | null>(null);
  const [cargandoCostoRetiro, setCargandoCostoRetiro] = useState(false);
  const [errorCostoRetiro, setErrorCostoRetiro] = useState<string | null>(null);

  useEffect(() => {
    if (!regionRetiro) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia la comuna al cambiar de región
      setComunasRetiro([]);
      setComunaRetiroNombre("");
      setComunaRetiroCode("");
      return;
    }

    setCargandoComunasRetiro(true);
    fetch(`/api/chilexpress/comunas?region=${regionRetiro}`)
      .then((res) => res.json())
      .then((data) => setComunasRetiro(data.areas ?? []))
      .finally(() => setCargandoComunasRetiro(false));
  }, [regionRetiro]);

  useEffect(() => {
    if (!comunaRetiroNombre) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia las oficinas si no hay comuna elegida
      setOficinas([]);
      setOficinaSeleccionada(null);
      setErrorOficinas(null);
      return;
    }

    setBuscandoOficinas(true);
    setErrorOficinas(null);
    fetch(`/api/chilexpress/oficinas?comuna=${encodeURIComponent(comunaRetiroNombre)}`)
      .then(async (res) => {
        const datos = await res.json();
        if (!res.ok) throw new Error(datos.error ?? "No se pudieron buscar sucursales.");
        setOficinas(datos.oficinas ?? []);
        setOficinaSeleccionada(datos.oficinas?.[0]?.officeCode ?? null);
      })
      .catch((err) =>
        setErrorOficinas(err instanceof Error ? err.message : "No se pudieron buscar sucursales.")
      )
      .finally(() => setBuscandoOficinas(false));
  }, [comunaRetiroNombre]);

  // Chilexpress cobra por el traslado entre la comuna de origen y la
  // comuna destino sin importar si el último tramo es a domicilio o
  // retiro en sucursal -- así que el retiro se cotiza igual que el
  // envío, usando la comuna de la sucursal elegida como destino.
  useEffect(() => {
    if (!comunaRetiroCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia el costo si no hay comuna elegida
      setCostoRetiro(0);
      setServicioRetiro(null);
      setErrorCostoRetiro(null);
      return;
    }

    setCargandoCostoRetiro(true);
    setErrorCostoRetiro(null);
    fetch("/api/chilexpress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationCountyCode: comunaRetiroCode }),
    })
      .then(async (res) => {
        const datos = await res.json();
        if (!res.ok) throw new Error(datos.error ?? "No se pudo calcular el costo de retiro.");
        const opciones = (datos.opciones ?? []) as OpcionEnvio[];
        const barata = opciones.reduce<OpcionEnvio | null>(
          (min, o) => (min === null || o.precio < min.precio ? o : min),
          null
        );
        setCostoRetiro(barata?.precio ?? 0);
        setServicioRetiro(barata?.servicio ?? null);
      })
      .catch((err) =>
        setErrorCostoRetiro(
          err instanceof Error ? err.message : "No se pudo calcular el costo de retiro."
        )
      )
      .finally(() => setCargandoCostoRetiro(false));
  }, [comunaRetiroCode]);

  const costoEnvio =
    entrega === "retiro"
      ? costoRetiro
      : opcionesEnvio.find((o) => o.servicio === servicioSeleccionado)?.precio ?? 0;
  const total = subtotal + costoEnvio;

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [depto, setDepto] = useState("");

  const [creandoPedido, setCreandoPedido] = useState(false);
  const [errorPedido, setErrorPedido] = useState<string | null>(null);
  const [pedidoCreado, setPedidoCreado] = useState<string | null>(null);

  // TODO: esto simula el pago hasta que se integre Getnet de verdad --
  // crea el pedido directo como "pagado", sin cobrar nada, para poder
  // probar de punta a punta el flujo de envío de Chilexpress y el
  // panel de admin. Los campos de tarjeta de la sección "Pago" son
  // solo decorativos y no se leen ni se guardan en ningún lado.
  async function pagar() {
    setErrorPedido(null);

    if (!nombre.trim() || !apellidos.trim() || !email.trim() || !telefono.trim()) {
      setErrorPedido("Completa nombre, apellidos, correo y teléfono.");
      return;
    }

    if (
      entrega === "envio" &&
      (!comunaCode || !calleEnvio.trim() || !numeroEnvio.trim() || servicioSeleccionado === null)
    ) {
      setErrorPedido("Completa la dirección de envío y elige un método de despacho.");
      return;
    }

    if (entrega === "retiro" && (!comunaRetiroCode || oficinaSeleccionada === null)) {
      setErrorPedido("Elige una sucursal de retiro.");
      return;
    }

    setCreandoPedido(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorPedido("Debes iniciar sesión para completar la compra.");
      setCreandoPedido(false);
      return;
    }

    const oficina = oficinas.find((o) => o.officeCode === oficinaSeleccionada);
    const comunaNombre =
      entrega === "envio"
        ? comunas.find((c) => c.countyCode === comunaCode)?.countyName ?? ""
        : comunaRetiroNombre;

    const { data: pedido, error: errorInsertPedido } = await supabase
      .from("pedidos")
      .insert({
        cliente_id: user.id,
        estado: "pagado",
        total,
        direccion:
          entrega === "envio"
            ? `${calleEnvio.trim()} ${numeroEnvio.trim()}`
            : `Retiro en ${oficina?.officeName ?? "sucursal"}`,
        comuna: comunaNombre,
        comuna_code: entrega === "envio" ? comunaCode : comunaRetiroCode,
        calle: entrega === "envio" ? calleEnvio.trim() : "DEFAULT",
        numero: entrega === "envio" ? numeroEnvio.trim() : "0",
        depto: entrega === "envio" ? depto.trim() || null : null,
        destinatario_nombre: `${nombre.trim()} ${apellidos.trim()}`.trim(),
        destinatario_telefono: telefono.trim(),
        destinatario_email: email.trim(),
        servicio_type_code: entrega === "envio" ? servicioSeleccionado : servicioRetiro,
        retiro_oficina_code: entrega === "retiro" ? oficinaSeleccionada : null,
        retiro_oficina_nombre: entrega === "retiro" ? oficina?.officeName ?? null : null,
      })
      .select("id")
      .single();

    if (errorInsertPedido || !pedido) {
      setErrorPedido(errorInsertPedido?.message ?? "No se pudo crear el pedido.");
      setCreandoPedido(false);
      return;
    }

    const { error: errorInsertItems } = await supabase.from("pedido_items").insert(
      items.map((item) => ({
        pedido_id: pedido.id,
        variante_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      }))
    );

    setCreandoPedido(false);

    if (errorInsertItems) {
      setErrorPedido(
        `El pedido se creó pero no se pudieron guardar los productos: ${errorInsertItems.message}`
      );
      return;
    }

    clearCart();
    setPedidoCreado(pedido.id);
  }

  if (pedidoCreado) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 bg-white px-6 text-center text-black">
        <p className="text-lg font-semibold">¡Pedido creado!</p>
        <p className="max-w-sm text-sm text-black/60">
          Como el pago con Getnet todavía no está implementado, este pedido se guardó
          directamente como pagado para poder probar el flujo de envío y el panel de admin.
        </p>
        <p className="font-mono text-xs text-black/40">{pedidoCreado}</p>
        <Link href="/mi-cuenta/pedidos" className="text-sm font-medium underline hover:opacity-70">
          Ver mis pedidos
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 bg-white text-black">
        <p className="text-black/60">Tu carrito está vacío.</p>
        <Link href="/" className="text-sm font-medium underline hover:opacity-70">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-5rem)] w-full bg-white text-black lg:grid-cols-2">
      <div className="border-b border-black/10 px-6 py-10 sm:px-12 lg:border-b-0 lg:border-r">
        <div className="mx-auto flex max-w-md flex-col gap-8">
          <div>
            <h2 className="text-lg font-semibold">Contacto</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className={inputClass}
              />
            </div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} mt-3`}
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className={`${inputClass} mt-3`}
            />
            <label className="mt-3 flex items-center gap-2 text-sm text-black/70">
              <input type="checkbox" className="h-4 w-4" />
              Enviarme novedades y ofertas por correo electrónico
            </label>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Entrega</h2>

            <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-md border border-black/15">
              <button
                type="button"
                onClick={() => setEntrega("envio")}
                className={`h-11 text-sm font-medium ${entrega === "envio" ? "bg-black text-white" : "bg-white text-black/60 hover:bg-black/5"}`}
              >
                Envío
              </button>
              <button
                type="button"
                onClick={() => setEntrega("retiro")}
                className={`h-11 border-l border-black/15 text-sm font-medium ${entrega === "retiro" ? "bg-black text-white" : "bg-white text-black/60 hover:bg-black/5"}`}
              >
                Retiro
              </button>
            </div>

            {entrega === "envio" && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className={inputClass}
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="" disabled>
                      Región
                    </option>
                    {regiones.map((r) => (
                      <option key={r.regionId} value={r.regionId}>
                        {r.regionName}
                      </option>
                    ))}
                  </select>

                  <select
                    className={inputClass}
                    value={comunaCode}
                    disabled={!region || cargandoComunas}
                    onChange={(e) => setComunaCode(e.target.value)}
                  >
                    <option value="">{cargandoComunas ? "Cargando..." : "Comuna"}</option>
                    {comunas.map((c) => (
                      <option key={c.countyCode} value={c.countyCode}>
                        {c.countyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <input
                    placeholder="Calle"
                    value={calleEnvio}
                    onChange={(e) => setCalleEnvio(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    placeholder="Número"
                    value={numeroEnvio}
                    onChange={(e) => setNumeroEnvio(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <input
                  placeholder="Casa, departamento, etc. (opcional)"
                  value={depto}
                  onChange={(e) => setDepto(e.target.value)}
                  className={inputClass}
                />
                <label className="flex items-center gap-2 text-sm text-black/70">
                  <input type="checkbox" className="h-4 w-4" />
                  Guardar mi información y consultar más rápidamente la próxima vez
                </label>
              </div>
            )}

            {entrega === "retiro" && (
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-sm text-black/50">Elige la comuna para ver las sucursales disponibles.</p>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    className={inputClass}
                    value={regionRetiro}
                    onChange={(e) => setRegionRetiro(e.target.value)}
                  >
                    <option value="" disabled>
                      Región
                    </option>
                    {regiones.map((r) => (
                      <option key={r.regionId} value={r.regionId}>
                        {r.regionName}
                      </option>
                    ))}
                  </select>

                  <select
                    className={inputClass}
                    value={comunaRetiroNombre}
                    disabled={!regionRetiro || cargandoComunasRetiro}
                    onChange={(e) => {
                      const nombre = e.target.value;
                      setComunaRetiroNombre(nombre);
                      setComunaRetiroCode(
                        comunasRetiro.find((c) => c.countyName === nombre)?.countyCode ?? ""
                      );
                    }}
                  >
                    <option value="">{cargandoComunasRetiro ? "Cargando..." : "Comuna"}</option>
                    {comunasRetiro.map((c) => (
                      <option key={c.countyCode} value={c.countyName}>
                        {c.countyName}
                      </option>
                    ))}
                  </select>
                </div>

                {comunaRetiroNombre && buscandoOficinas && (
                  <p className="text-sm text-black/50">Buscando sucursales...</p>
                )}

                {comunaRetiroNombre && !buscandoOficinas && errorOficinas && (
                  <p className="text-sm text-red-600">{errorOficinas}</p>
                )}

                {comunaRetiroNombre && !buscandoOficinas && !errorOficinas && oficinas.length === 0 && (
                  <p className="text-sm text-black/50">No hay sucursales en esa comuna.</p>
                )}

                {oficinas.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {oficinas.map((oficina) => (
                      <label
                        key={oficina.officeCode}
                        className={`flex cursor-pointer flex-col gap-0.5 rounded-md border p-3 text-sm ${
                          oficinaSeleccionada === oficina.officeCode ? "border-black" : "border-black/15"
                        }`}
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <input
                            type="radio"
                            name="oficina"
                            checked={oficinaSeleccionada === oficina.officeCode}
                            onChange={() => setOficinaSeleccionada(oficina.officeCode)}
                            className="h-4 w-4"
                          />
                          {oficina.officeName}
                        </span>
                        <span className="pl-6 text-black/50">
                          {oficina.direccion}, {oficina.comuna}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {entrega === "envio" && (
          <div>
            <h2 className="text-lg font-semibold">Métodos de envío</h2>

            {!comunaCode && (
              <div className="mt-3 rounded-md bg-black/5 p-4 text-sm text-black/60">
                Ingresa tu dirección de envío para ver los métodos disponibles.
              </div>
            )}

            {comunaCode && cargandoEnvio && (
              <div className="mt-3 rounded-md bg-black/5 p-4 text-sm text-black/60">
                Calculando el costo de envío...
              </div>
            )}

            {comunaCode && !cargandoEnvio && errorEnvio && (
              <div className="mt-3 rounded-md bg-red-50 p-4 text-sm text-red-600">{errorEnvio}</div>
            )}

            {comunaCode && !cargandoEnvio && !errorEnvio && (
              <div className="mt-3 flex flex-col gap-2">
                {opcionesEnvio.map((opcion) => (
                  <label
                    key={opcion.servicio}
                    className={`flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm ${
                      servicioSeleccionado === opcion.servicio ? "border-black" : "border-black/15"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="envio"
                        checked={servicioSeleccionado === opcion.servicio}
                        onChange={() => setServicioSeleccionado(opcion.servicio)}
                        className="h-4 w-4"
                      />
                      {opcion.descripcion}
                    </span>
                    <span className="font-medium">{formatoPrecio.format(opcion.precio)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          )}

          <div>
            <h2 className="text-lg font-semibold">Pago</h2>
            <p className="text-sm text-black/50">
              Todas las transacciones son seguras y están encriptadas.
            </p>

            <div className="mt-3 rounded-md border border-black bg-black/[.02] p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="radio" name="pago" checked readOnly className="h-4 w-4" />
                  Tarjeta de crédito
                </label>
                <div className="flex gap-1.5">
                  {TARJETAS.map((t) => (
                    <span
                      key={t}
                      className="flex h-6 items-center rounded border border-black/10 bg-white px-2 text-[10px] font-semibold text-black/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <input placeholder="Número de tarjeta" className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Fecha de vencimiento (MM / AA)" className={inputClass} />
                  <input placeholder="Código de seguridad" className={inputClass} />
                </div>
                <input placeholder="Nombre del titular" className={inputClass} />
                <div className="grid grid-cols-[100px_1fr] gap-3">
                  <select className={inputClass} defaultValue="RUT">
                    <option value="RUT">RUT</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                  <input placeholder="Número de documento" className={inputClass} />
                </div>
                <select className={inputClass} defaultValue="">
                  <option value="" disabled>
                    Cuotas
                  </option>
                  <option value="1">1 cuota sin interés</option>
                  <option value="3">3 cuotas</option>
                  <option value="6">6 cuotas</option>
                  <option value="12">12 cuotas</option>
                </select>
              </div>
            </div>
          </div>

          {errorPedido && <p className="text-sm text-red-600">{errorPedido}</p>}

          <button
            type="button"
            onClick={pagar}
            disabled={creandoPedido}
            className="flex h-12 items-center justify-center rounded-md bg-black text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black/80 disabled:opacity-50"
          >
            {creandoPedido ? "Procesando..." : `Pagar ${formatoPrecio.format(total)}`}
          </button>
        </div>
      </div>

      <div className="bg-zinc-50 px-6 py-10 sm:px-12">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-14 shrink-0 rounded-md bg-black/5">
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                    {item.cantidad}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.nombre}</p>
                  {(item.talla || item.color) && (
                    <p className="text-xs text-black/50">
                      {[item.talla ? `Talla ${item.talla}` : null, item.color]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {formatoPrecio.format(item.precio * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            <input
              placeholder="Código de descuento"
              className={`${inputClass} bg-white`}
            />
            <button
              type="button"
              className="rounded-md border border-black/15 px-5 text-sm font-medium text-black/60 hover:bg-black/5"
            >
              Aplicar
            </button>
          </div>

          <div className="flex flex-col gap-2 border-t border-black/10 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-black/60">Subtotal</span>
              <span>{formatoPrecio.format(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black/60">Envío</span>
              <span
                className={
                  entrega === "envio" && servicioSeleccionado === null ? "text-black/60" : undefined
                }
              >
                {entrega === "retiro"
                  ? oficinaSeleccionada === null
                    ? "Elegir sucursal de retiro"
                    : cargandoCostoRetiro
                    ? "Calculando..."
                    : errorCostoRetiro
                    ? "No se pudo calcular"
                    : formatoPrecio.format(costoRetiro)
                  : servicioSeleccionado === null
                  ? "Introducir la dirección de envío"
                  : formatoPrecio.format(costoEnvio)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/10 pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>
              <span className="mr-1 text-xs font-normal text-black/40">CLP</span>
              {formatoPrecio.format(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
