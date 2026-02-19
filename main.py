from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json

with open("salida_fusionada.json", "r", encoding="utf-8") as f:
    BASE_BOE = json.load(f)

import re

app = FastAPI()

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# CARGA DE DATOS BOE
# ============================================================

with open("salida_fusionada.json", "r", encoding="utf-8") as f:
    VALORES_VENALES = json.load(f)

# ============================================================
# COEFICIENTES IVTM (EJEMPLOS PRINCIPALES)
# ============================================================

COEFICIENTES_MUNICIPALES = {
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
}
BONIFICACION_ELECTRICOS = {
    "MADRID": 0.75,
    "BARCELONA": 0.75,
    "VALENCIA": 0.75,
    "SEVILLA": 0.75,
    "MALAGA": 0.75,
    "ZARAGOZA": 0.75,
    "BILBAO": 0.75,
    # Puedes añadir más municipios si quieres
}

# ============================================================
# MAPEO PROVINCIA -> CCAA E ITP POR CCAA
# ============================================================

PROVINCIA_A_CCAA = {
    # Andalucía
    "ALMERIA": "ANDALUCIA",
    "CADIZ": "ANDALUCIA",
    "CORDOBA": "ANDALUCIA",
    "GRANADA": "ANDALUCIA",
    "HUELVA": "ANDALUCIA",
    "JAEN": "ANDALUCIA",
    "MALAGA": "ANDALUCIA",
    "SEVILLA": "ANDALUCIA",
    # Aragón
    "HUESCA": "ARAGON",
    "TERUEL": "ARAGON",
    "ZARAGOZA": "ARAGON",
    # Asturias
    "ASTURIAS": "ASTURIAS",
    # Illes Balears
    "BALEARES": "BALEARES",
    "ILLESBALEARS": "BALEARES",
    # Canarias
    "LASPALMAS": "CANARIAS",
    "SANTACRUZDETENERIFE": "CANARIAS",
    # Cantabria
    "CANTABRIA": "CANTABRIA",
    # Castilla y León
    "AVILA": "CASTILLA_Y_LEON",
    "BURGOS": "CASTILLA_Y_LEON",
    "LEON": "CASTILLA_Y_LEON",
    "PALENCIA": "CASTILLA_Y_LEON",
    "SALAMANCA": "CASTILLA_Y_LEON",
    "SEGOVIA": "CASTILLA_Y_LEON",
    "SORIA": "CASTILLA_Y_LEON",
    "VALLADOLID": "CASTILLA_Y_LEON",
    "ZAMORA": "CASTILLA_Y_LEON",
    # Castilla-La Mancha
    "ALBACETE": "CASTILLA_LA_MANCHA",
    "CIUDADREAL": "CASTILLA_LA_MANCHA",
    "CUENCA": "CASTILLA_LA_MANCHA",
    "GUADALAJARA": "CASTILLA_LA_MANCHA",
    "TOLEDO": "CASTILLA_LA_MANCHA",
    # Cataluña
    "BARCELONA": "CATALUNA",
    "GIRONA": "CATALUNA",
    "LLEIDA": "CATALUNA",
    "LERIDA": "CATALUNA",
    "TARRAGONA": "CATALUNA",
    # Comunidad Valenciana
    "ALICANTE": "COMUNIDAD_VALENCIANA",
    "CASTELLON": "COMUNIDAD_VALENCIANA",
    "VALENCIA": "COMUNIDAD_VALENCIANA",
    # Extremadura
    "BADAJOZ": "EXTREMADURA",
    "CACERES": "EXTREMADURA",
    # Galicia
    "ACORUNA": "GALICIA",
    "LUGO": "GALICIA",
    "OURENSE": "GALICIA",
    "PONTEVEDRA": "GALICIA",
    # Madrid
    "MADRID": "MADRID",
    # Murcia
    "MURCIA": "MURCIA",
    # Navarra
    "NAVARRA": "NAVARRA",
    # País Vasco
    "ALAVA": "PAIS_VASCO",
    "ARABA": "PAIS_VASCO",
    "GUIPUZCOA": "PAIS_VASCO",
    "GIPUZKOA": "PAIS_VASCO",
    "VIZCAYA": "PAIS_VASCO",
    "BIZKAIA": "PAIS_VASCO",
    # La Rioja
    "RIOJA": "LA_RIOJA",
    "LARIOJA": "LA_RIOJA",
    # Ceuta y Melilla
    "CEUTA": "CEUTA",
    "MELILLA": "MELILLA",
}

ITP_POR_CCAA = {
    "ANDALUCIA": 0.04,
    "ARAGON": 0.04,
    "ASTURIAS": 0.08,
    "BALEARES": 0.04,
    "CANARIAS": 0.05,
    "CANTABRIA": 0.08,
    "CASTILLA_Y_LEON": 0.05,
    "CASTILLA_LA_MANCHA": 0.06,
    "CATALUNA": 0.05,
    "COMUNIDAD_VALENCIANA": 0.06,
    "EXTREMADURA": 0.06,
    "GALICIA": 0.08,
    "MADRID": 0.04,
    "MURCIA": 0.04,
    "NAVARRA": 0.04,
    "PAIS_VASCO": 0.04,
    "LA_RIOJA": 0.04,
    "CEUTA": 0.04,
    "MELILLA": 0.04,
}

# ============================================================
# MODELOS Pydantic
# ============================================================

class SolicitudCalculo(BaseModel):
    marca: Optional[str] = None
    modelo: Optional[str] = None
    anio: Optional[int] = None
    combustible: Optional[str] = None
    potencia: Optional[float] = None
    cilindrada: Optional[float] = None
    precio_base: float
    emisiones_co2: float
    pais_origen: str
    provincia_matriculacion: Optional[str] = None
    municipio_matriculacion: Optional[str] = None
    iva_incluido: bool
    incluir_gestoria: bool
    tipo_compra: Optional[str] = None  # "particular" | "empresa"
    tipo_itv: Optional[str] = None
    placas_verdes: bool = False
    matriculas_espanolas: bool = False
    boe_index: Optional[int] = None


class BusquedaModelo(BaseModel):
    marca: Optional[str] = None
    modelo: Optional[str] = None
    anio: Optional[int] = None
    combustible: Optional[str] = None
    cilindrada: Optional[float] = None
    potencia: Optional[float] = None


class ModeloCoincidente(BaseModel):
    indice: int
    marca: str
    modelo: str
    anio_inicio: int
    anio_fin: Optional[int]
    cc: Optional[float] = None
    kw: Optional[float] = None
    combustible: Optional[str] = None
    cvf: Optional[float] = None
    cv: Optional[float] = None
    valor: float
    puntuacion: float
# ============================================================
# ÍNDICE OPTIMIZADO PARA BÚSQUEDA RÁPIDA
# ============================================================

INDICE_MODELOS = {}

def norm(x: str):
    if not x:
        return ""
    return (
        x.lower()
         .replace(" ", "")
         .replace("-", "")
         .replace(".", "")
         .replace("\r", "")
         .replace("\n", "")
    )

for item in VALORES_VENALES:
    marca_norm = norm(item.get("marca", ""))
    modelo_norm = norm(item.get("modelo_limpio") or item.get("modelo", ""))

    clave = (marca_norm, modelo_norm)

    if clave not in INDICE_MODELOS:
        INDICE_MODELOS[clave] = []

    INDICE_MODELOS[clave].append(item)

# ============================================================
# FUNCIONES AUXILIARES DE TEXTO / NORMALIZACIÓN
# ============================================================

def normalizar(texto) -> str:
    if texto is None:
        return ""
    texto = str(texto).upper()
    texto = texto.replace("-", " ").replace("/", " ")
    texto = re.sub(r"([A-Z]+)([0-9]+)", r"\1 \2", texto)
    texto = re.sub(r"([0-9]+)([A-Z]+)", r"\1 \2", texto)
    texto = re.sub(r"[^A-Z0-9 ]", " ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto


def normalizar_combustible(c: Optional[str]) -> str:
    if not c:
        return ""
    c = c.upper().replace(" ", "").strip()

    # Híbridos gasolina + eléctrico (GyE, G+E, etc.)
    if c in ["GYE", "G+E", "G/E", "GY+E"]:
        return "HIBRIDO_GASOLINA"

    # Híbridos diésel + eléctrico (DyE, D+E, etc.)
    if c in ["DYE", "D+E", "D/E", "DY+E"]:
        return "HIBRIDO_DIESEL"

    # Gasolina
    if c in ["G", "GAS", "GASO", "GASOL", "GASOLINA", "GSL"]:
        return "GASOLINA"

    # Diésel
    if c in ["D", "DIE", "DIESEL", "DSL", "GASOLEO", "GASÓLEO"]:
        return "DIESEL"

    # Eléctrico
    if c in ["ELC", "ELEC", "EV", "ELECTRICO", "ELÉCTRICO"]:
        return "ELECTRICO"

    return c


def tokens_modelos_sin_ruido(tokens):
    # Punto de extensión por si quieres filtrar más adelante
    return tokens


def tokens_modelo(texto_norm: str):
    if not texto_norm:
        return []
    texto_norm = re.sub(r"([A-Za-z]+)([0-9]+)", r"\1 \2", texto_norm)
    texto_norm = re.sub(r"([0-9]+)([A-Za-z]+)", r"\1 \2", texto_norm)
    texto_norm = re.sub(r"\s+", " ", texto_norm).strip()
    raw_tokens = texto_norm.split()

    tokens_finales = []
    for t in raw_tokens:
        if t in [
            "4MATIC", "QUATTRO", "XDRIVE", "AUTO", "DCT", "AMG",
            "EDITION", "SPORT", "LINE", "PACK", "PK", "TIPTRONIC"
        ]:
            continue
        tokens_finales.append(t)

    return tokens_modelos_sin_ruido(tokens_finales)


def coincide_por_año(anio_usuario, anio_inicio, anio_fin):
    if anio_usuario is None:
        return True
    if anio_inicio is None and anio_fin is None:
        return True

    if anio_inicio is None:
        anio_inicio = anio_usuario
    if anio_fin is None:
        anio_fin = anio_inicio

    if anio_inicio <= anio_usuario <= anio_fin:
        return True

    # Tolerancia de ±2 años
    if (anio_usuario < anio_inicio and (anio_inicio - anio_usuario) <= 2) or \
       (anio_usuario > anio_fin and (anio_usuario - anio_fin) <= 2):
        return True

    return False


def coincide_modelo_inteligente(tokens_user, tokens_item):
    if not tokens_user or not tokens_item:
        return 0.0

    base_user = tokens_user[0]
    base_item = tokens_item[0]

    score_nombre = 0.0

    # Coincidencia exacta
    if base_user == base_item:
        score_nombre += 30.0
    # Prefijo: GLB -> GLB200
    elif base_item.startswith(base_user) or base_user.startswith(base_item):
        score_nombre += 25.0
    # Inclusión parcial
    elif base_user in base_item or base_item in base_user:
        score_nombre += 20.0

    # Tokens en común (sin números)
    coincidencias = 0
    for t in tokens_user:
        if t.isdigit():
            continue
        if t in tokens_item:
            coincidencias += 1

    if coincidencias > 0:
        score_nombre += coincidencias * 8.0

    return score_nombre

# ============================================================
# MATCHING BOE
# ============================================================

def score_modelo_boe(
    item,
    marca_norm: str,
    modelo_tokens_user,
    anio: Optional[int],
    cilindrada: Optional[float],
    potencia_cv: Optional[float],
    combustible_usuario: Optional[str],
):
    score = 0.0

    marca_item = normalizar(item.get("marca", ""))
    modelo_item_norm = normalizar(item.get("modelo_limpio", "") or item.get("modelo", ""))
    modelo_tokens_item = tokens_modelo(modelo_item_norm)
    combustible_item = str(item.get("combustible", "") or "").upper()

    # Marca obligatoria
    if marca_norm and marca_item != marca_norm:
        return 0.0
    score += 40.0

    # Nombre (soft match)
    if modelo_tokens_user:
        score_nombre = coincide_modelo_inteligente(modelo_tokens_user, modelo_tokens_item)
        if score_nombre > 0:
            score += score_nombre
        else:
            score -= 15.0

    # Año
    if anio is not None:
        if coincide_por_año(anio, item.get("año_inicio"), item.get("año_fin")):
            score += 20.0
        else:
            score -= 30.0

    # Cilindrada
    if cilindrada is not None and item.get("cc") is not None:
        try:
            diff_cc = abs(float(item["cc"]) - float(cilindrada))
            if diff_cc <= 100:
                score += 20.0
            elif diff_cc <= 200:
                score += 10.0
            else:
                score -= 25.0
        except Exception:
            pass

    # Potencia
    if potencia_cv is not None and item.get("cv") is not None:
        try:
            diff_cv = abs(float(item["cv"]) - float(potencia_cv))
            if diff_cv <= 10:
                score += 20.0
            elif diff_cv <= 20:
                score += 10.0
            else:
                score -= 25.0
        except Exception:
            pass

    # Combustible
    if combustible_usuario:
        comb_user = normalizar_combustible(combustible_usuario)
        comb_item = normalizar_combustible(combustible_item)

        if comb_user and comb_item == comb_user:
            score += 15.0
        elif comb_user and comb_item != comb_user:
            score -= 30.0

    return score


def buscar_modelos_coincidentes(
    marca: Optional[str],
    modelo: Optional[str],
    anio: Optional[int],
    combustible: Optional[str],
    cilindrada: Optional[float],
    potencia: Optional[float],
    max_resultados: int = 10,
):
    # Normalizamos igual que antes
    marca_norm = normalizar(marca)
    modelo_norm = normalizar(modelo)
    modelo_tokens_user = tokens_modelo(modelo_norm)

    # 🔥 Usamos el índice optimizado
    clave = (norm(marca), norm(modelo))
    candidatos = INDICE_MODELOS.get(clave, [])

    resultados = []

    # 🔥 Recorremos solo los candidatos, no toda la base
    for item in candidatos:
        idx_real = VALORES_VENALES.index(item)
        s = score_modelo_boe(
            item=item,
            marca_norm=marca_norm,
            modelo_tokens_user=modelo_tokens_user,
            anio=anio,
            cilindrada=cilindrada,
            potencia_cv=potencia,
            combustible_usuario=combustible,
        )

        if s <= 0:
            continue

        resultados.append(
            ModeloCoincidente(
                indice=idx_real,
                marca=item.get("marca", ""),
                modelo=item.get("modelo_limpio", "") or item.get("modelo", ""),
                anio_inicio=item.get("año_inicio"),
                anio_fin=item.get("año_fin"),
                cc=item.get("cc"),
                kw=item.get("kw"),
                combustible=item.get("combustible"),
                cvf=item.get("cvf"),
                cv=item.get("cv"),
                valor=float(item.get("valor", 0) or 0),
                puntuacion=s,
            )
        )

    resultados.sort(key=lambda x: x.puntuacion, reverse=True)
    return resultados[:max_resultados]



# ============================================================
# ENDPOINT: BUSCAR MODELOS
# ============================================================

@app.post("/api/buscar-modelos")
async def buscar_modelos(datos: BusquedaModelo):
    coincidencias = buscar_modelos_coincidentes(
        marca=datos.marca,
        modelo=datos.modelo,
        anio=datos.anio,
        combustible=datos.combustible,
        cilindrada=datos.cilindrada,
        potencia=datos.potencia,
    )
    return {"coincidencias": [c.dict() for c in coincidencias]}

# ============================================================
# IA SIMPLIFICADA (PLACEHOLDER)
# ============================================================

@app.post("/api/preguntar-ia")
async def preguntar_ia(payload: dict):
    tipo = payload.get("tipo")

    if tipo == "cilindrada":
        return {"cilindrada": 1995}

    if tipo == "emisiones":
        return {"emisiones_co2": 120}

    if tipo == "coeficiente_ivtm":
        cvf = payload.get("cvf", 10)
        if cvf < 12:
            return {"coeficiente": 1.2}
        elif cvf < 16:
            return {"coeficiente": 1.4}
        else:
            return {"coeficiente": 1.6}

    raise HTTPException(status_code=400, detail="Tipo de IA no reconocido")

# ============================================================
# CAMBIOS NECESARIOS AQUÍ ↓↓↓
# ============================================================

def limpiar_valor_boe(raw_valor):
    if isinstance(raw_valor, str):
        raw_valor = raw_valor.replace(".", "").replace(",", ".")
    try:
        return float(raw_valor)
    except:
        return 0.0


def aplicar_coeficiente_antiguedad(base: float, anio_vehiculo: int | None) -> float:
    anio_actual = 2026  # ← AÑO BASE OFICIAL BOE

    if not anio_vehiculo:
        return base

    antiguedad = anio_actual - anio_vehiculo

    coef = {
        1: 0.84,
        2: 0.67,
        3: 0.56,
        4: 0.47,
        5: 0.39,
        6: 0.34,
        7: 0.28,
        8: 0.24,
        9: 0.19,
        10: 0.17,
        11: 0.13,
        12: 0.10,
        13: 0.10,
        14: 0.10,
    }

    if antiguedad <= 0:
        antiguedad = 1

    if antiguedad >= 15:
        return base * 0.05

    return base * coef.get(antiguedad, 0.10)


# ============================================================
# BASE MATRICULACIÓN (REHECHA Y CORRECTA)
# ============================================================

def calcular_base_matriculacion(valor_venal_depreciado: float,
                                precio_sin_iva: float) -> float:
    """
    Devuelve la base imponible correcta para el Impuesto de Matriculación:
    el MAYOR entre el valor venal depreciado y el precio sin IVA.
    """
    return max(valor_venal_depreciado, precio_sin_iva)


# ============================================================
# ENDPOINT: CALCULAR
# ============================================================

@app.post("/api/calcular")
async def calcular(datos: SolicitudCalculo):

    if datos.boe_index is None:
        raise HTTPException(status_code=400, detail="No se seleccionó modelo BOE")

    try:
        modelo_boe = VALORES_VENALES[datos.boe_index]
    except Exception:
        raise HTTPException(status_code=400, detail="Índice BOE inválido")

    if modelo_boe.get("modelo_limpio"):
        modelo_boe["modelo"] = modelo_boe["modelo_limpio"]

    precio_usuario = float(datos.precio_base)
    co2 = float(datos.emisiones_co2)

    # -------------------------------
    # 1) VALOR BASE DEL BOE
    # -------------------------------
    raw_valor = (
        modelo_boe.get("valor")
        or modelo_boe.get("valor_nuevo")
        or modelo_boe.get("valor_venal")
        or modelo_boe.get("valor_base")
        or 0
    )
    valor_base = limpiar_valor_boe(raw_valor)

    # -------------------------------
    # 2) VALOR VENAL DEPRECIADO
    # -------------------------------
    try:
        anio_int = int(str(datos.anio).strip())
    except:
        anio_int = None

    valor_venal_depreciado = aplicar_coeficiente_antiguedad(valor_base, anio_int)

    # -------------------------------
    # 3) PRECIO SIN IVA REAL
    # -------------------------------
    if datos.tipo_compra == "particular":
        precio_sin_iva = precio_usuario
    else:
        if datos.iva_incluido:
            precio_sin_iva = precio_usuario / 1.21
        else:
            precio_sin_iva = precio_usuario

    # -------------------------------
    # 4) BASE IMPONIBLE = MAYOR ENTRE AMBOS
    # -------------------------------
    base_matriculacion = calcular_base_matriculacion(
        valor_venal_depreciado,
        precio_sin_iva
    )

    # -------------------------------
    # 5) IMPUESTO DE MATRICULACIÓN
    # -------------------------------
    impuesto_matriculacion = calcular_impuesto_matriculacion(
        base_matriculacion,
        co2
    )

    # DEBUG
    print(
        "DEBUG MATRIC:",
        f"valor_base_BOE={valor_base}",
        f"valor_venal_depreciado={valor_venal_depreciado}",
        f"precio_sin_iva={precio_sin_iva}",
        f"base_matriculacion={base_matriculacion}",
        f"impuesto_final={impuesto_matriculacion}",
    )

    return {
        "valor_base_boe": valor_base,
        "valor_venal_depreciado": round(valor_venal_depreciado, 2),
        "precio_sin_iva": round(precio_sin_iva, 2),
        "base_matriculacion": round(base_matriculacion, 2),
        "impuesto_matriculacion": impuesto_matriculacion,
    }
