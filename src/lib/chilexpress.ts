import "server-only";

// Ambiente de test de Chilexpress. Cuando se tengan credenciales
// productivas, cambiar por el host de producción (lo entrega
// soporteintegraciones@chilexpress.cl junto con las claves).
const BASE_URL = "https://testservices.wschilexpress.com";
const API_VERSION = "1.0";

// Comuna desde la que se despachan los pedidos (sucursal de Pudahuel).
// Cambiar si la bodega se traslada a otra comuna.
const ORIGEN_COUNTY_CODE = "PUDA";

// Datos fijos del negocio para generar envíos. Son placeholders de
// prueba -- hay que reemplazarlos por los reales antes de producción
// (RUT de la empresa, contacto de la tienda como remitente, dirección
// donde Chilexpress debe devolver un paquete si no se pudo entregar,
// y el TCC -- Tarjeta Cliente Chilexpress -- de la cuenta empresa
// real cuando exista; mientras tanto se usa el TCC de prueba).
const MARKETPLACE_RUT = "DEFAULT";
const TCC_PRUEBA = "18578680";
const REMITENTE = {
  nombre: "Tamehouse",
  telefono: "123456789",
  email: "contacto@tamehouse.cl",
};
const DIRECCION_DEVOLUCION = {
  countyCoverageCode: ORIGEN_COUNTY_CODE,
  streetName: "DEFAULT",
  streetNumber: 0,
};

interface CourierServiceOptionApi {
  serviceTypeCode: number;
  serviceDescription: string;
  serviceValue: string;
}

interface CotizadorResponseApi {
  data?: { courierServiceOptions?: CourierServiceOptionApi[] };
  statusCode: number;
  statusDescription: string;
}

interface CoverageAreaApi {
  countyCode: string;
  countyName: string;
  regionCode: string;
  coverageName: string;
  queryMode: number;
}

interface CoberturaResponseApi {
  coverageAreas?: CoverageAreaApi[];
  statusCode: number;
  statusDescription: string;
}

export type AreaCobertura = {
  countyCode: string;
  countyName: string;
  regionCode: string;
  coverageName: string;
};

export async function getCoberturaAreas(regionCode: string): Promise<AreaCobertura[]> {
  const apiKey = process.env.CHILEXPRESS_API_KEY_COBERTURA;
  if (!apiKey) throw new Error("Falta configurar CHILEXPRESS_API_KEY_COBERTURA.");

  const url = `${BASE_URL}/georeference/api/v${API_VERSION}/coverage-areas?RegionCode=${encodeURIComponent(regionCode)}&type=0`;

  const respuesta = await fetch(url, {
    headers: { "Ocp-Apim-Subscription-Key": apiKey },
  });

  const datos = (await respuesta.json()) as CoberturaResponseApi;
  if (!respuesta.ok || datos.statusCode !== 0) {
    throw new Error(datos.statusDescription || "No se pudo consultar la cobertura.");
  }

  // queryMode 1 = la comuna en sí; 2 = un sector/localidad rural dentro
  // de ella (mismo countyName, distinto countyCode) -- se filtran para
  // no repetir el nombre de la comuna varias veces en el selector.
  return (datos.coverageAreas ?? [])
    .filter((area) => area.queryMode === 1)
    .map((area) => ({
      countyCode: area.countyCode,
      countyName: area.countyName,
      regionCode: area.regionCode,
      coverageName: area.coverageName,
    }));
}

interface RegionApi {
  regionId: string;
  regionName: string;
}

interface RegionsResponseApi {
  regions?: RegionApi[];
  statusCode: number;
  statusDescription: string;
}

export type Region = { regionId: string; regionName: string };

export async function getRegiones(): Promise<Region[]> {
  const apiKey = process.env.CHILEXPRESS_API_KEY_COBERTURA;
  if (!apiKey) throw new Error("Falta configurar CHILEXPRESS_API_KEY_COBERTURA.");

  const url = `${BASE_URL}/georeference/api/v${API_VERSION}/regions`;

  const respuesta = await fetch(url, {
    headers: { "Ocp-Apim-Subscription-Key": apiKey },
  });

  const datos = (await respuesta.json()) as RegionsResponseApi;
  if (!respuesta.ok || datos.statusCode !== 0) {
    throw new Error(datos.statusDescription || "No se pudieron consultar las regiones.");
  }

  return (datos.regions ?? []).map((r) => ({ regionId: r.regionId, regionName: r.regionName }));
}

export type PaqueteEnvio = {
  pesoKg: number;
  altoCm: number;
  anchoCm: number;
  largoCm: number;
  valorDeclarado: number;
};

export type OpcionEnvio = {
  servicio: number;
  descripcion: string;
  precio: number;
};

export async function cotizarEnvio(
  destinationCountyCode: string,
  paquete: PaqueteEnvio
): Promise<OpcionEnvio[]> {
  const apiKey = process.env.CHILEXPRESS_API_KEY_COTIZADOR;
  if (!apiKey) throw new Error("Falta configurar CHILEXPRESS_API_KEY_COTIZADOR.");

  const url = `${BASE_URL}/rating/api/v${API_VERSION}/rates/courier`;

  const respuesta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": apiKey,
    },
    body: JSON.stringify({
      originCountyCode: ORIGEN_COUNTY_CODE,
      destinationCountyCode,
      package: {
        weight: paquete.pesoKg.toFixed(2),
        height: String(Math.max(1, Math.round(paquete.altoCm))),
        width: String(Math.max(1, Math.round(paquete.anchoCm))),
        length: String(Math.max(1, Math.round(paquete.largoCm))),
      },
      productType: 3,
      contentType: 1,
      declaredWorth: String(Math.max(1, Math.round(paquete.valorDeclarado))),
      deliveryTime: 0,
    }),
  });

  const datos = (await respuesta.json()) as CotizadorResponseApi;
  if (!respuesta.ok || datos.statusCode !== 0) {
    throw new Error(datos.statusDescription || "No se pudo cotizar el envío.");
  }

  return (datos.data?.courierServiceOptions ?? []).map((opcion) => ({
    servicio: opcion.serviceTypeCode,
    descripcion: opcion.serviceDescription,
    precio: Number(opcion.serviceValue),
  }));
}

interface OfficeApi {
  officeCode: number;
  officeName: string;
  countyName: string;
  regionName: string;
  streetName: string;
  streetNumber: number;
}

interface OfficesResponseApi {
  offices?: OfficeApi[];
  statusCode: number;
  statusDescription: string;
}

export type Oficina = {
  officeCode: number;
  officeName: string;
  comuna: string;
  region: string;
  direccion: string;
};

// Tipo de oficina: 4 = Tiendas Pick Up. Se usa 1 (oficinas Chilexpress
// normales) como valor por defecto -- no vimos el resto de la tabla
// de códigos, ajustar si en la práctica no trae resultados esperados.
const TIPO_OFICINA_DEFECTO = 1;

// Busca las oficinas de una comuna directamente por nombre, sin
// necesitar geocodificar ninguna dirección primero (a diferencia de
// nearby-offices, que exigía un addressId y fallaba seguido con
// direcciones reales por lo estricto del matching).
export async function getOficinasPorComuna(countyName: string): Promise<Oficina[]> {
  const apiKey = process.env.CHILEXPRESS_API_KEY_COBERTURA;
  if (!apiKey) throw new Error("Falta configurar CHILEXPRESS_API_KEY_COBERTURA.");

  const url = `${BASE_URL}/georeference/api/v${API_VERSION}/offices?Type=${TIPO_OFICINA_DEFECTO}&CountyName=${encodeURIComponent(countyName)}`;

  const respuesta = await fetch(url, {
    headers: { "Ocp-Apim-Subscription-Key": apiKey },
  });

  const datos = (await respuesta.json()) as OfficesResponseApi;

  // "No existe una oficina asociada a esta comuna" viene con HTTP 400
  // pero es un resultado válido (comuna sin sucursales), no un error.
  if (datos.statusCode === -1) return [];

  if (!respuesta.ok || datos.statusCode !== 0) {
    throw new Error(datos.statusDescription || "No se pudieron consultar las oficinas.");
  }

  return (datos.offices ?? []).map((office) => ({
    officeCode: office.officeCode,
    officeName: office.officeName,
    comuna: office.countyName,
    region: office.regionName,
    direccion: `${office.streetName} ${office.streetNumber}`,
  }));
}

export type DireccionDestino = {
  countyCoverageCode: string;
  streetName: string;
  streetNumber: number;
  supplement?: string;
};

export type ContactoDestinatario = {
  nombre: string;
  telefono: string;
  email: string;
};

export type DatosOrdenTransporte = {
  referencia: string;
  destino: DireccionDestino;
  destinatario: ContactoDestinatario;
  paquete: PaqueteEnvio & { servicioTypeCode: number };
  // Si se define, el envío se genera para retiro en esa sucursal en
  // vez de despacho a domicilio.
  retiroEnOficina?: { officeCode: number };
};

export type OrdenTransporteCreada = {
  numeroOrden: number;
  numeroSeguimiento: string;
  // Imagen de la etiqueta (JPEG en base64) que trae la propia
  // respuesta de Generar envío -- no hace falta pedirla aparte.
  etiquetaBase64: string | null;
};

interface LabelApi {
  labelData: string;
  labelType: string;
}

interface TransportOrderDetailApi {
  transportOrderNumber: number;
  barcode: string;
  label?: LabelApi;
  statusCode: number;
  statusDescription: string;
}

interface TransportOrderResponseApi {
  data?: { detail?: TransportOrderDetailApi[] };
  statusCode: number;
  statusDescription: string;
}

export async function crearOrdenTransporte(
  datos: DatosOrdenTransporte
): Promise<OrdenTransporteCreada> {
  const apiKey = process.env.CHILEXPRESS_API_KEY_ENVIOS;
  if (!apiKey) throw new Error("Falta configurar CHILEXPRESS_API_KEY_ENVIOS.");

  const url = `${BASE_URL}/transport-orders/api/v${API_VERSION}/transport-orders`;

  const respuesta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": apiKey,
    },
    body: JSON.stringify({
      header: {
        certificateNumber: 0,
        customerCardNumber: TCC_PRUEBA,
        countyOfOriginCoverageCode: ORIGEN_COUNTY_CODE,
        labelType: 2,
        marketplaceRut: MARKETPLACE_RUT,
        sellerRut: "DEFAULT",
      },
      details: [
        {
          addresses: [
            {
              addressId: 0,
              countyCoverageCode: datos.destino.countyCoverageCode,
              streetName: datos.destino.streetName,
              streetNumber: datos.destino.streetNumber,
              supplement: datos.destino.supplement ?? "",
              addressType: "DEST",
              deliveryOnCommercialOffice: !!datos.retiroEnOficina,
              ...(datos.retiroEnOficina
                ? { commercialOfficeId: String(datos.retiroEnOficina.officeCode) }
                : {}),
              observation: "DEFAULT",
            },
            {
              addressId: 0,
              countyCoverageCode: DIRECCION_DEVOLUCION.countyCoverageCode,
              streetName: DIRECCION_DEVOLUCION.streetName,
              streetNumber: DIRECCION_DEVOLUCION.streetNumber,
              supplement: "DEFAULT",
              addressType: "DEV",
              deliveryOnCommercialOffice: false,
              observation: "DEFAULT",
            },
          ],
          contacts: [
            {
              name: REMITENTE.nombre,
              phoneNumber: REMITENTE.telefono,
              mail: REMITENTE.email,
              contactType: "R",
            },
            {
              name: datos.destinatario.nombre,
              phoneNumber: datos.destinatario.telefono,
              mail: datos.destinatario.email,
              contactType: "D",
            },
          ],
          packages: [
            {
              weight: datos.paquete.pesoKg.toFixed(2),
              height: String(Math.max(1, Math.round(datos.paquete.altoCm))),
              width: String(Math.max(1, Math.round(datos.paquete.anchoCm))),
              length: String(Math.max(1, Math.round(datos.paquete.largoCm))),
              serviceDeliveryCode: String(datos.paquete.servicioTypeCode),
              productCode: "3",
              deliveryReference: datos.referencia,
              groupReference: "",
              declaredValue: String(Math.max(1, Math.round(datos.paquete.valorDeclarado))),
              declaredContent: "1",
              // El pago ya se cobró con Getnet antes de despachar --
              // no es venta contra-entrega.
              receivableAmountInDelivery: 0,
            },
          ],
        },
      ],
    }),
  });

  const cuerpo = (await respuesta.json()) as TransportOrderResponseApi;
  const detalle = cuerpo.data?.detail?.[0];

  if (!respuesta.ok || !detalle || detalle.statusCode !== 0) {
    throw new Error(
      detalle?.statusDescription || cuerpo.statusDescription || "No se pudo generar el envío."
    );
  }

  return {
    numeroOrden: detalle.transportOrderNumber,
    numeroSeguimiento: detalle.barcode,
    etiquetaBase64: detalle.label?.labelData ?? null,
  };
}

interface TrackingEventApi {
  eventDate: string;
  eventHour: string;
  description: string;
  location: string | null;
}

interface TransportOrderDataApi {
  // Ojo: en esta respuesta viene como string, a diferencia del
  // transportOrderNumber de Generar envío que es numérico.
  transportOrderNumber: string;
  product: string;
  service: string;
  status: string;
  locationStatus: string;
}

interface TrackingResponseApi {
  data?: {
    trackingEvents?: TrackingEventApi[] | null;
    transportOrderData?: TransportOrderDataApi;
  } | null;
  statusCode: number;
  statusDescription: string;
}

export type EventoSeguimiento = {
  fecha: string;
  hora: string;
  descripcion: string;
  ubicacion: string | null;
};

export type EstadoEnvio = {
  numeroOrden: string;
  estado: string;
  ubicacionEstado: string;
  producto: string;
  servicio: string;
  eventos: EventoSeguimiento[];
};

// Consulta el estado de una orden de transporte ya generada. Se puede
// buscar por número de OT, por la referencia (id del pedido) o por
// rut de la empresa -- al menos uno de los tres debe venir.
export async function consultarEnvio(params: {
  transportOrderNumber?: number;
  reference?: string;
  rut?: number;
}): Promise<EstadoEnvio> {
  const apiKey = process.env.CHILEXPRESS_API_KEY_ENVIOS;
  if (!apiKey) throw new Error("Falta configurar CHILEXPRESS_API_KEY_ENVIOS.");

  const url = `${BASE_URL}/transport-orders/api/v${API_VERSION}/tracking`;

  const respuesta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": apiKey,
    },
    body: JSON.stringify({
      transportOrderNumber: params.transportOrderNumber,
      reference: params.reference,
      rut: params.rut,
      showTrackingEvents: 1,
    }),
  });

  const cuerpo = (await respuesta.json()) as TrackingResponseApi;
  const orden = cuerpo.data?.transportOrderData;

  if (!respuesta.ok || cuerpo.statusCode !== 0 || !orden) {
    throw new Error(cuerpo.statusDescription || "No se pudo consultar el envío.");
  }

  return {
    numeroOrden: orden.transportOrderNumber,
    estado: orden.status,
    ubicacionEstado: orden.locationStatus,
    producto: orden.product,
    servicio: orden.service,
    eventos: (cuerpo.data?.trackingEvents ?? []).map((e) => ({
      fecha: e.eventDate,
      hora: e.eventHour,
      descripcion: e.description,
      ubicacion: e.location,
    })),
  };
}

interface CertificateDetailApi {
  product: string;
  service: string;
  amount: number;
}

export type DetalleCertificado = { producto: string; servicio: string; cantidad: number };

interface GenerarCertificadoResponseApi {
  certificateNumber: number;
  statusCode: number;
  statusDescription: string;
}

// Crea un certificado vacío al que luego se le pueden asociar envíos
// (pasando su número en el header de Generar envío) y que se cierra
// al final del día con cerrarCertificado para entregarle al courier
// el manifiesto de retiro. Requiere un TCC válido -- sin uno,
// Chilexpress responde "No existe Tarjeta Chilexpress (TCC)".
export async function generarCertificado(customerCardNumber = TCC_PRUEBA): Promise<number> {
  const apiKey = process.env.CHILEXPRESS_API_KEY_ENVIOS;
  if (!apiKey) throw new Error("Falta configurar CHILEXPRESS_API_KEY_ENVIOS.");

  const url = `${BASE_URL}/transport-orders/api/v${API_VERSION}/transport-order-certificates?customerCardNumber=${encodeURIComponent(customerCardNumber)}`;

  const respuesta = await fetch(url, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": apiKey },
  });

  const datos = (await respuesta.json()) as GenerarCertificadoResponseApi;
  if (!respuesta.ok || datos.statusCode !== 0) {
    throw new Error(datos.statusDescription || "No se pudo generar el certificado.");
  }

  return datos.certificateNumber;
}

interface ConsultaCertificadoResponseApi {
  data?: {
    certificateNumber: number;
    rutNumber: number;
    businessName: string;
    amountOfPieces: number;
    pickupAddress: string;
    detail?: CertificateDetailApi[];
  } | null;
  statusCode: number;
  statusDescription: string;
}

export type InfoCertificado = {
  numeroCertificado: number;
  rut: number;
  nombreEmpresa: string;
  cantidadPiezas: number;
  direccionRetiro: string;
  detalle: DetalleCertificado[];
};

export async function consultarCertificado(certificateNumber: string): Promise<InfoCertificado> {
  const apiKey = process.env.CHILEXPRESS_API_KEY_ENVIOS;
  if (!apiKey) throw new Error("Falta configurar CHILEXPRESS_API_KEY_ENVIOS.");

  const url = `${BASE_URL}/transport-orders/api/v${API_VERSION}/transport-order-certificates/${encodeURIComponent(certificateNumber)}`;

  const respuesta = await fetch(url, {
    headers: { "Ocp-Apim-Subscription-Key": apiKey },
  });

  const datos = (await respuesta.json()) as ConsultaCertificadoResponseApi;
  if (!respuesta.ok || datos.statusCode !== 0 || !datos.data) {
    throw new Error(datos.statusDescription || "No se pudo consultar el certificado.");
  }

  return {
    numeroCertificado: datos.data.certificateNumber,
    rut: datos.data.rutNumber,
    nombreEmpresa: datos.data.businessName,
    cantidadPiezas: datos.data.amountOfPieces,
    direccionRetiro: datos.data.pickupAddress,
    detalle: (datos.data.detail ?? []).map((d) => ({
      producto: d.product,
      servicio: d.service,
      cantidad: d.amount,
    })),
  };
}

interface CierreCertificadoResponseApi {
  closedCertificate?: {
    certificateNumber: string;
    printedDate: string;
    amountOfPieces: number;
    detail?: CertificateDetailApi[];
  } | null;
  statusCode: number;
  statusDescription: string;
}

export type CertificadoCerrado = {
  numeroCertificado: string;
  fechaImpresion: string;
  cantidadPiezas: number;
  detalle: DetalleCertificado[];
};

export async function cerrarCertificado(datos: {
  certificateNumber: number;
  // 1 = imagen binaria, 2 = Datos
  certificateType: number;
  dropNumber?: number;
}): Promise<CertificadoCerrado> {
  const apiKey = process.env.CHILEXPRESS_API_KEY_ENVIOS;
  if (!apiKey) throw new Error("Falta configurar CHILEXPRESS_API_KEY_ENVIOS.");

  const url = `${BASE_URL}/transport-orders/api/v${API_VERSION}/transport-order-certificates`;

  const respuesta = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": apiKey,
    },
    body: JSON.stringify({
      certificateNumber: datos.certificateNumber,
      certificateType: datos.certificateType,
      dropNumber: datos.dropNumber ?? 0,
    }),
  });

  const cuerpo = (await respuesta.json()) as CierreCertificadoResponseApi;
  if (!respuesta.ok || cuerpo.statusCode !== 0 || !cuerpo.closedCertificate) {
    throw new Error(cuerpo.statusDescription || "No se pudo cerrar el certificado.");
  }

  return {
    numeroCertificado: cuerpo.closedCertificate.certificateNumber,
    fechaImpresion: cuerpo.closedCertificate.printedDate,
    cantidadPiezas: cuerpo.closedCertificate.amountOfPieces,
    detalle: (cuerpo.closedCertificate.detail ?? []).map((d) => ({
      producto: d.product,
      servicio: d.service,
      cantidad: d.amount,
    })),
  };
}
