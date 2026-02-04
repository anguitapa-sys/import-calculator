/* ============================
   TABLAS LOCALES (solo municipios principales)
============================ */
const COEFICIENTES_MUNICIPALES = {
  "MADRID": 1.67,
  "BARCELONA": 2.00,
  "VALENCIA": 1.80,
  "SEVILLA": 1.55,
  "MALAGA": 1.45,
  "ZARAGOZA": 1.50,
  "BILBAO": 1.70,
  "ALCORCON": 1.45,
  "MOSTOLES": 1.45,
  "GETAFE": 1.45,
  "LEGANES": 1.45,
};

/* ============================
   FALLBACK LOCAL IVTM (sin IA)
============================ */
const IVTM_FALLBACK = [
  { max_cc: 1200, importe: 35 },
  { max_cc: 1600, importe: 55 },
  { max_cc: 2000, importe: 95 },
  { max_cc: 2500, importe: 120 },
  { max_cc: 3000, importe: 150 },
  { max_cc: 9999, importe: 200 }
];

/* ============================
   UTILIDADES
============================ */
function formato(num) {
  if (isNaN(num) || num === null) return "0 €";
  return Number(num).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " €";
}

/* Flecha rotatoria + mostrar/ocultar desglose */
function toggleDesglose(id, btn) {
  const box = document.getElementById(id);
  const abierto = box.classList.contains("visible");

  if (abierto) {
    box.classList.remove("visible");
    btn.classList.remove("abierto");
  } else {
    box.classList.add("visible");
    btn.classList.add("abierto");
  }
}

/* ============================
   IA 
============================ */
async function rellenarConIA(event) {
  const marca = document.getElementById("marca").value.trim();
  const modelo = document.getElementById("modelo").value.trim();
  const anio = Number(document.getElementById("anio").value);
  const combustible = document.getElementById("combustible").value;
  const potencia = Number(document.getElementById("potencia").value);

  if (!marca || !modelo || !anio || !combustible || !potencia) {
    alert("Rellena marca, modelo, año, combustible y potencia antes de usar la IA.");
    return;
  }

  try {
    const res = await fetch("https://import-backend-d8n1.onrender.com/api/preguntar-ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "datos_coche",
        marca,
        modelo,
        anio,
        combustible,
        potencia
      })
    });

    const data = await res.json();

    if (data.cilindrada) {
      document.getElementById("cilindrada").value = data.cilindrada;
    }
    if (data.emisiones_co2) {
      document.getElementById("emisiones_co2").value = data.emisiones_co2;
    }

    alert("Datos rellenados con IA correctamente.");

  } catch (err) {
    console.error("Error IA:", err);
    alert("Error al obtener datos desde la IA.");
  }
}

async function rellenarCilindradaIA(event) {
  const marca = document.getElementById("marca").value.trim();
  const modelo = document.getElementById("modelo").value.trim();
  const anio = Number(document.getElementById("anio").value);
  const combustible = document.getElementById("combustible").value;
  const potencia = Number(document.getElementById("potencia").value);
  const msg = document.getElementById("msg_cilindrada");
  const boton = event.target;
  const original = boton.innerHTML;
  boton.disabled = true;
  boton.innerHTML = `<span class="btn-spinner"></span> Cargando…`;

  msg.textContent = "";

  if (!marca || !modelo || !anio || !combustible || !potencia) {
  msg.textContent = "Rellena marca, modelo, año, combustible y potencia antes de usar la IA.";
  msg.style.color = "var(--accent)";
  boton.disabled = false;
  boton.innerHTML = original;
  return;
}


  try {
    const res = await fetch("https://import-backend-d8n1.onrender.com/api/preguntar-ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "datos_coche",
        marca,
        modelo,
        anio,
        combustible,
        potencia
      })
    });

    const data = await res.json();

     // La IA devuelve un JSON dentro de un string → hay que parsearlo
     let parsed = {};
     try {
        parsed = JSON.parse(data.respuesta);
       } catch (e) {
        console.error("Error parseando JSON IA:", e);
    }

if (parsed.cilindrada) {
  document.getElementById("cilindrada").value = parsed.cilindrada;
}


  } catch (err) {
    console.error(err);
    msg.textContent = "Error al conectar con la IA.";
    msg.style.color = "var(--accent)";
  }
  boton.disabled = false;
  boton.innerHTML = original;
}


async function rellenarEmisionesIA(event) {
  const marca = document.getElementById("marca").value.trim();
  const modelo = document.getElementById("modelo").value.trim();
  const anio = Number(document.getElementById("anio").value);
  const combustible = document.getElementById("combustible").value;
  const potencia = Number(document.getElementById("potencia").value);
  const msg = document.getElementById("msg_emisiones");

  const boton = event.target;
  const original = boton.innerHTML;
  boton.disabled = true;
  boton.innerHTML = `<span class="btn-spinner"></span> Cargando…`;

  msg.textContent = "";

  if (!marca || !modelo || !anio || !combustible || !potencia) {
    msg.textContent = "Rellena marca, modelo, año, combustible y potencia antes de usar la IA.";
    msg.style.color = "var(--accent)";
    boton.disabled = false;
    boton.innerHTML = original;
    return;
  }

  try {
    const res = await fetch("https://import-backend-d8n1.onrender.com/api/preguntar-ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "datos_coche",
        marca,
        modelo,
        anio,
        combustible,
        potencia
      })
    });

    const data = await res.json();

    // La IA devuelve JSON dentro de un string → hay que parsearlo
    let parsed = {};
    try {
      parsed = JSON.parse(data.respuesta);
    } catch (e) {
      console.error("Error parseando JSON IA:", e);
    }

    if (parsed.emisiones_co2) {
      document.getElementById("emisiones_co2").value = parsed.emisiones_co2;
      msg.textContent = "Emisiones rellenadas correctamente con IA.";
      msg.style.color = "green";
    } else {
      msg.textContent = "No se han podido obtener las emisiones.";
      msg.style.color = "var(--accent)";
    }

  } catch (err) {
    console.error(err);
    msg.textContent = "Error al conectar con la IA.";
    msg.style.color = "var(--accent)";
  }

  boton.disabled = false;
  boton.innerHTML = original;
}


/* ============================
   BUSCAR MODELOS EN EL BACKEND
============================ */
let coincidenciasGlobal = [];
let modeloSeleccionado = null;

async function buscarModelos() {
  const loading = document.getElementById("loading-screen");
  loading.classList.add("active");

  try {
    const payload = {
      marca: document.getElementById("marca").value.trim(),
      modelo: document.getElementById("modelo").value.trim(),
      anio: Number(document.getElementById("anio").value),
      combustible: document.getElementById("combustible").value,
      potencia: Number(document.getElementById("potencia").value),
      cilindrada: Number(document.getElementById("cilindrada").value)
    };

    const res = await fetch("https://import-backend-d8n1.onrender.com/api/buscar-modelos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    coincidenciasGlobal = data.coincidencias || [];

    if (coincidenciasGlobal.length === 0) {
      document.getElementById("error").textContent =
        "No se han encontrado modelos coincidentes en el BOE.";
      return;
    }

    mostrarModal();

  } catch (err) {
    console.error("Error buscando modelos:", err);
    document.getElementById("error").textContent =
      "Error al conectar con el servidor.";
  } finally {
    loading.classList.remove("active");
  }
}

/* ============================
   MODAL SELECCIÓN MODELO
============================ */
function mostrarModal() {
  const overlay = document.getElementById("modalOverlay");
  const lista = document.getElementById("listaModelos");
  const continuarBtn = document.getElementById("continuarBtn");

  lista.innerHTML = "";
  modeloSeleccionado = null;

  coincidenciasGlobal.forEach((m, i) => {
    const card = document.createElement("div");
    card.className = "modelo-card";
    card.innerHTML = `
      <strong>${m.modelo}</strong><br>
      Año: ${m.anio_inicio}–${m.anio_fin}<br>
      CC: ${m.cc} · ${m.cv} CV (${m.kw} kW) · Combustible: ${m.combustible}<br>
      Valor venal: ${m.valor} €
    `;
    card.onclick = () => seleccionarModelo(i, card);
    lista.appendChild(card);
  });

  continuarBtn.style.display =
    coincidenciasGlobal.length === 1 ? "block" : "none";

  overlay.style.display = "flex";
}

function seleccionarModelo(i, card) {
  modeloSeleccionado = coincidenciasGlobal[i].indice;
  document.querySelectorAll(".modelo-card").forEach(c =>
    c.classList.remove("selected")
  );
  card.classList.add("selected");
  document.getElementById("continuarBtn").style.display = "block";
}

function confirmarModelo() {
  document.getElementById("modalOverlay").style.display = "none";
  calcularImportacion();
}

/* ============================
   SISTEMA HÍBRIDO: IVTM (Circulación)
============================ */
async function calcularIVTM(cilindrada, provincia, municipio) {

  const municipioUpper = municipio.trim().toUpperCase();

  // 1) Si el municipio está en la tabla → cálculo oficial
  const coefMunicipal = COEFICIENTES_MUNICIPALES[municipioUpper];

  if (coefMunicipal) {
    const cv_fiscales = 0.08 * Math.pow(cilindrada, 0.6);

    let tarifa_base = 0;
    if (cv_fiscales <= 8) tarifa_base = 12.62;
    else if (cv_fiscales <= 11.99) tarifa_base = 34.08;
    else if (cv_fiscales <= 15.99) tarifa_base = 71.94;
    else if (cv_fiscales <= 19.99) tarifa_base = 89.61;
    else tarifa_base = 112.00;

    const importe = tarifa_base * coefMunicipal;

    return {
      origen: "tabla",
      cv_fiscales: cv_fiscales.toFixed(2),
      tarifa_base,
      coef_municipal: coefMunicipal,
      importe: Number(importe.toFixed(2)),
      explicacion: "Calculado usando tabla oficial de municipios principales."
    };
  }

 // 2) Si NO está → preguntar a la IA del backend
try {
  const res = await fetch("https://import-backend-d8n1.onrender.com/api/preguntar-ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: "coeficiente_ivtm",
      municipio,
      provincia,
      cvf: 0.08 * Math.pow(cilindrada, 0.6)
    })
  });

  const data = await res.json();
  const coef = Number(data.coeficiente || 1.5);

  const cv_fiscales = 0.08 * Math.pow(cilindrada, 0.6);

  let tarifa_base = 0;
  if (cv_fiscales <= 8) tarifa_base = 12.62;
  else if (cv_fiscales <= 11.99) tarifa_base = 34.08;
  else if (cv_fiscales <= 15.99) tarifa_base = 71.94;
  else if (cv_fiscales <= 19.99) tarifa_base = 89.61;
  else tarifa_base = 112.00;

  const importe = tarifa_base * coef;

  return {
    origen: "ia",
    cv_fiscales: cv_fiscales.toFixed(2),
    tarifa_base,
    coef_municipal: coef,
    importe: Number(importe.toFixed(2)),
    explicacion: "Coeficiente obtenido mediante IA (municipio no disponible en tabla)."
  };

} catch (err) {
  console.error("Error IVTM IA:", err);
  return {
    origen: "fallback",
    cv_fiscales: "—",
    tarifa_base: "—",
    coef_municipal: "—",
    importe: 80,
    explicacion: "Error con IA. Se usa estimación aproximada."
  };
}

}

// Mostrar/ocultar el bloque de IVA según tipo de compra
document.getElementById("tipo_compra").addEventListener("change", function () {
  const tipo = this.value;
  const bloqueIVA = document.getElementById("bloque_iva");

  if (tipo === "particular") {
    bloqueIVA.style.display = "none";
    document.getElementById("iva_incluido").value = ""; // limpiar selección
  } else {
    bloqueIVA.style.display = "block";
  }
});

/* ============================
   CÁLCULO DE IMPUESTOS
============================ */
async function calcularImportacion() {
  const loading = document.getElementById("loading-screen");
  loading.classList.add("active");

  try {

    const precio = Number(document.getElementById("precio_base").value);
    const ivaIncluido = document.getElementById("iva_incluido").value;
    const tipoCompra = document.getElementById("tipo_compra").value;
    const co2 = Number(document.getElementById("emisiones_co2").value);
    const provincia = document.getElementById("provincia_matriculacion").value;
    const municipio = document.getElementById("municipio_matriculacion").value;
    const cilindrada = Number(document.getElementById("cilindrada").value);
    const anio = Number(document.getElementById("anio").value);
    const km = Number(document.getElementById("kilometros").value) || 0;

   // Determinar si el coche es nuevo según normativa UE
   const anioActual = new Date().getFullYear();
   // Criterios oficiales aproximados:
   // - Menos de 1 año desde matriculación
   // - Menos de 6.000 km
   const esCocheNuevo = (anio >= anioActual - 1) || (km < 6000);

    let iva = 0;

    // IVA solo se paga si NO está incluido y el coche es nuevo
    if (ivaIncluido === "no" && esCocheNuevo) {
      iva = precio * 0.21;
    }

    // Régimen de margen → IVA siempre 0
    if (ivaIncluido === "margen") {
      iva = 0;
    }

    let itp = 0;

    if (tipoCompra === "particular" && !esCocheNuevo) {
      itp = precio * 0.04;
    }


    /* ITV */
    let itv = 60;

    /* Matriculación (tasas DGT) */
    let matriculacion = 99.77;

    /* Placas verdes */
    let placas = document.getElementById("placas_verdes").value === "si" ? 20 : 0;

    /* Matrículas */
    let matriculas = document.getElementById("matriculas_espanolas").value === "si" ? 15 : 0;

    /* Gestoría */
    let gestoria = document.getElementById("incluir_gestoria").checked ? 120 : 0;

    /* Impuesto de Matriculación (CO₂) */
    let tipoMat = 0;
    if (co2 < 120) tipoMat = 0;
    else if (co2 < 160) tipoMat = 4.75;
    else if (co2 < 200) tipoMat = 9.75;
    else tipoMat = 14.75;

    const impMat = precio * (tipoMat / 100);

    /* Impuesto de Circulación (HÍBRIDO) */
    const ivtm = await calcularIVTM(cilindrada, provincia, municipio);
    const circulacion = ivtm?.importe ?? 0;

    /* TOTAL */
    const total =
      precio +
      iva +
      itp +
      itv +
      matriculacion +
      impMat +
      circulacion +
      placas +
      matriculas +
      gestoria;

    /* ============================
       RELLENAR FACTURA
    ============================ */
    document.getElementById("pantallaCalculadora").style.display = "none";
    document.getElementById("pantallaFactura").style.display = "block";

    document.getElementById("f_precio_base").textContent = formato(precio);
    document.getElementById("f_iva_incluido").textContent = formato(iva);
    document.getElementById("f_itp").textContent = formato(itp);
    document.getElementById("f_itv").textContent = formato(itv);
    document.getElementById("f_matriculacion").textContent = formato(matriculacion);
    document.getElementById("f_matriculacion_co2").textContent = formato(impMat);
    document.getElementById("f_circulacion").textContent = formato(circulacion);
    document.getElementById("f_placas_verdes").textContent = formato(placas);
    document.getElementById("f_matriculas").textContent = formato(matriculas);
    document.getElementById("f_gestoria").textContent = formato(gestoria);
    document.getElementById("f_total").textContent = formato(total);
   
    // Convertir valores a booleanos útiles
    const ivaEsIncluido = ivaIncluido === "si";
    const esParticular = tipoCompra === "particular";



/* ============================
   DESGLOSES FACTURA (FUNCIONANDO + CONDICIONES)
============================ */

/* PRECIO BASE */
document.getElementById("d_precio").innerHTML = `
  <p><strong>Precio base del vehículo</strong></p>
  <p>Es el precio neto del coche antes de aplicar cualquier impuesto o gasto adicional.</p>
  <p><strong>Importe:</strong> ${formato(precio)}</p>
`;

let textoIVA = "";

/* VENTA ENTRE PARTICULARES (PRIORIDAD MÁXIMA) */
if (tipoCompra === "particular") {
  textoIVA = `
    <p><strong>Venta entre particulares</strong></p>
    <p>Los particulares no pueden aplicar IVA en la venta de vehículos.</p>
    <p>No se paga IVA en origen ni en España, independientemente de si el coche es nuevo o usado.</p>
    <p><strong>Importe aplicado:</strong> 0 €</p>
  `;
}

/* IVA INCLUIDO (concesionario del país de origen) */
else if (ivaIncluido === "si") {
  textoIVA = `
    <p><strong>IVA incluido en origen</strong></p>
    <p>El precio del vehículo ya incluye el IVA del país donde se compra (por ejemplo, Alemania 19%).</p>
    <p>No debes pagar IVA adicional en España.</p>
    <p><strong>Importe aplicado:</strong> 0 €</p>
  `;
}

/* IVA NO INCLUIDO */
else if (ivaIncluido === "no") {
  if (esCocheNuevo) {
    textoIVA = `
      <p><strong>IVA no incluido</strong></p>
      <p>El vehículo se considera nuevo según normativa UE.</p>
      <p>Debes pagar el IVA español (21%) al matricularlo.</p>
      <p><strong>Importe aplicado:</strong> ${formato(iva)}</p>
    `;
  } else {
    textoIVA = `
      <p><strong>IVA no incluido</strong></p>
      <p>El vehículo es usado y la operación es entre empresas.</p>
      <p>No se paga IVA en España ni en el país de origen.</p>
      <p><strong>Importe aplicado:</strong> 0 €</p>
    `;
  }
}

/* RÉGIMEN DE MARGEN */
else if (ivaIncluido === "margen") {
  textoIVA = `
    <p><strong>Régimen de margen</strong></p>
    <p>El concesionario tributa solo por su beneficio.</p>
    <p>No se aplica IVA al comprador ni en origen ni en España.</p>
    <p><strong>Importe aplicado:</strong> 0 €</p>
  `;
}

document.getElementById("d_iva").innerHTML = textoIVA;



/* ITP */
let textoITP = "";

if (tipoCompra === "particular" && !esCocheNuevo) {
  textoITP = `
    <p><strong>ITP aplicable</strong></p>
    <p>Compra entre particulares. Tipo aplicable: <strong>4%</strong></p>
    <p>Cálculo:</p>
    <p>Precio base: ${formato(precio)}</p>
    <p>Tipo: 4% → ${precio} × 0.04</p>
    <p><strong>Importe final:</strong> ${formato(itp)}</p>
  `;
} else {
  textoITP = `
    <p><strong>ITP no aplicable</strong></p>
    <p>No se paga ITP en compras a empresa o vehículos nuevos.</p>
    <p><strong>Importe:</strong> 0 €</p>
  `;
}

document.getElementById("d_itp").innerHTML = textoITP;




/* ITV */
document.getElementById("d_itv").innerHTML = `
  <p><strong>ITV de importación</strong></p>
  <p>Incluye inspección técnica + tasas de tráfico.</p>
  <p><strong>Importe:</strong> ${formato(itv)}</p>
`;

/* MATRICULACIÓN (TASA DGT) */
document.getElementById("d_matriculacion").innerHTML = `
  <p><strong>Tasa de matriculación</strong></p>
  <p>Es la tasa fija que cobra la DGT por emitir la matrícula española.</p>
  <p><strong>Importe:</strong> ${formato(matriculacion)}</p>
`;

/* IMPUESTO MATRICULACIÓN CO₂ */
document.getElementById("d_matriculacion_co2").innerHTML = `
  <p><strong>Impuesto de Matriculación (según CO₂)</strong></p>
  <p>Emisiones declaradas: <strong>${co2} g/km</strong></p>
  <p>Tipo aplicable: <strong>${tipoMat}%</strong></p>
  <p>Cálculo:</p>
  <p>Precio base: ${formato(precio)}</p>
  <p>Tipo: ${tipoMat}% → ${precio} × (${tipoMat} / 100)</p>
  <p><strong>Importe final:</strong> ${formato(impMat)}</p>
`;


/* CIRCULACIÓN */
let textoCirculacion = "";

if (ivtm.origen === "tabla") {
  // CÁLCULO OFICIAL (cuando sí hay datos)
  textoCirculacion = `
    <p><strong>Impuesto de Circulación (IVTM)</strong></p>

    <p><strong>Cilindrada:</strong> ${cilindrada} cc</p>
    <p><strong>Caballos fiscales:</strong> ${ivtm.cv_fiscales}</p>
    <p><strong>Tarifa base:</strong> ${formato(ivtm.tarifa_base)}</p>
    <p><strong>Coeficiente municipal (${municipio}):</strong> ${ivtm.coef_municipal}</p>

    <p><strong>Cálculo:</strong></p>
    <p>${formato(ivtm.tarifa_base)} × ${ivtm.coef_municipal}</p>

    <p><strong>Importe final:</strong> ${formato(circulacion)}</p>
  `;
} else {
  // MODO ESTIMADO (fallback)
  textoCirculacion = `
    <p><strong>Impuesto de Circulación (IVTM)</strong></p>

    <p><strong>Cilindrada:</strong> ${cilindrada} cc</p>
    <p><strong>Importe estimado:</strong> ${formato(circulacion)}</p>

    <p style="opacity:0.7;">(Cálculo aproximado por cilindrada. Puede variar según el ayuntamiento.)</p>
  `;
}

document.getElementById("d_circulacion").innerHTML = textoCirculacion;




/* PLACAS VERDES */
document.getElementById("d_placas").innerHTML = `
  <p><strong>Placas verdes</strong></p>
  <p>Placas temporales necesarias para circular mientras se tramita la matriculación definitiva.</p>
  <p><strong>Importe:</strong> ${formato(placas)}</p>
`;

/* MATRÍCULAS */
document.getElementById("d_matriculas").innerHTML = `
  <p><strong>Matrículas definitivas</strong></p>
  <p>Incluye el coste de las placas físicas (delanteras y traseras).</p>
  <p><strong>Importe:</strong> ${formato(matriculas)}</p>
`;

/* GESTORÍA */
document.getElementById("d_gestoria").innerHTML = `
  <p><strong>Gestoría</strong></p>
  <p>Incluye la tramitación completa: ITV, tasas, impuestos, documentación y matriculación.</p>
  <p><strong>Importe:</strong> ${formato(gestoria)}</p>
`;

  } catch (err) {
    console.error("Error en el cálculo:", err);
    alert("Error al calcular la importación.");
  } finally {
    loading.classList.remove("active");
  }
}


/* ============================
   VOLVER A LA CALCULADORA
============================ */
function volverCalculadora() {
  document.getElementById("pantallaFactura").style.display = "none";
  document.getElementById("pantallaCalculadora").style.display = "block";
}

/* ============================
   MODO OSCURO
============================ */
function toggleDarkMode() {
  document.body.classList.toggle("dark");

  const btn = document.getElementById("darkToggle");
  if (document.body.classList.contains("dark")) {
    btn.textContent = "Modo claro";
  } else {
    btn.textContent = "Modo oscuro";
  }
}
async function recalcIVTM() {
  const cilindrada = Number(document.getElementById("cilindrada").value);
  const provincia = document.getElementById("provincia_matriculacion").value.trim();
  const municipio = document.getElementById("municipio_matriculacion").value.trim();
  const msg = document.getElementById("msg_ivtm_preview");

  // Si falta algo, no mostramos nada
  if (!cilindrada || !provincia || !municipio) {
    msg.textContent = "";
    return;
  }

  // Llamamos a tu función híbrida
  const ivtm = await calcularIVTM(cilindrada, provincia, municipio);

  if (!ivtm) {
    msg.textContent = "";
    return;
  }

  msg.textContent = `IVTM estimado: ${ivtm.importe} €`;
}

document.getElementById("provincia_matriculacion").addEventListener("input", recalcIVTM);
document.getElementById("municipio_matriculacion").addEventListener("input", recalcIVTM);
