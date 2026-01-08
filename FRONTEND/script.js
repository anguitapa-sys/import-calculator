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
   IA (simulada)
============================ */
function rellenarCilindrada() {
  const modelo = document.getElementById("modelo").value.trim();
  if (!modelo) return alert("Introduce un modelo primero");
  document.getElementById("cilindrada").value = 2148;
}

function rellenarEmisiones() {
  const modelo = document.getElementById("modelo").value.trim();
  if (!modelo) return alert("Introduce un modelo primero");
  document.getElementById("emisiones_co2").value = 120;
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

  // 2) Si NO está → fallback local (sin IA)
  for (const fila of IVTM_FALLBACK) {
    if (cilindrada <= fila.max_cc) {
      return {
        origen: "fallback",
        cv_fiscales: "—",
        tarifa_base: "—",
        coef_municipal: "—",
        importe: fila.importe,
        explicacion: "Cálculo estimado según cilindrada."
      };
    }
  }
}

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

    /* IVA */
    let iva = 0;
    if (ivaIncluido === "no") iva = precio * 0.21;

    /* ITP (simplificado: 4% si particular) */
    let itp = tipoCompra === "particular" ? precio * 0.04 : 0;

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

/* IVA */
document.getElementById("d_iva").innerHTML = ivaEsIncluido ? `
  <p><strong>IVA incluido</strong></p>
  <p>El precio del vehículo ya incorpora el IVA correspondiente.</p>
  <p><strong>Importe:</strong> ${formato(iva)}</p>
` : `
  <p><strong>IVA no incluido</strong></p>
  <p>El vehículo se adquiere sin IVA (operación entre empresas o régimen especial).</p>
  <p><strong>Importe:</strong> ${formato(iva)}</p>
`;

/* ITP */
document.getElementById("d_itp").innerHTML = esParticular ? `
  <p><strong>Impuesto de Transmisiones Patrimoniales (ITP)</strong></p>
  <p>Se aplica cuando compras un vehículo usado a un particular.</p>
  <p><strong>Importe:</strong> ${formato(itp)}</p>
` : `
  <p><strong>ITP no aplicable</strong></p>
  <p>En operaciones entre empresas no se paga ITP.</p>
  <p><strong>Importe:</strong> ${formato(itp)}</p>
`;

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
  <p>Depende de las emisiones homologadas del vehículo.</p>
  <p><strong>Importe:</strong> ${formato(impMat)}</p>
`;

/* CIRCULACIÓN */
document.getElementById("d_circulacion").innerHTML = `
  <p><strong>Impuesto de Circulación</strong></p>
  <p>Depende de la potencia fiscal del vehículo y del ayuntamiento.</p>
  <p><strong>Importe:</strong> ${formato(circulacion)}</p>
`;

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
