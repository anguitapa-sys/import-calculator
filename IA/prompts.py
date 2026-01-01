from models.vehiculo import DatosVehiculo

def construir_prompt(datos: DatosVehiculo) -> str:
    return f"""
Eres un asistente experto en fichas técnicas de vehículos homologados en Europa.

Tu tarea:
A partir de los datos que te doy (marca, modelo, año, potencia, combustible y, si existe, cilindrada),
debes estimar los datos técnicos que faltan del vehículo, con el foco en:
- cilindrada del motor (cc)
- emisiones de CO₂ oficiales aproximadas (g/km)
- tipo de motor (gasolina_atmosferico, gasolina_turbo, diesel_turbo, otro)
- una descripción corta de la versión probable
- un nivel de confianza entre 0 y 1

Devuelve SIEMPRE un JSON válido con esta estructura:

{{
  "cilindrada": number | null,
  "emisiones_co2": number | null,
  "tipo_motor": string | null,
  "version_descriptiva": string | null,
  "nivel_confianza": number
}}

DATOS DEL VEHÍCULO:
Marca: {datos.marca}
Modelo: {datos.modelo}
Año: {datos.anio}
Potencia: {datos.potencia_cv}
Combustible: {datos.combustible}
Cilindrada conocida: {datos.cilindrada}
Emisiones conocidas: {datos.emisiones}
"""
