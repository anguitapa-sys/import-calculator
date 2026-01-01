import json
import os
from dotenv import load_dotenv
from openai import OpenAI

from models.vehiculo import DatosVehiculo, RespuestaIA
from IA.prompts import construir_prompt

# Cargar variables del .env
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Inicializar cliente de OpenAI
client = OpenAI(api_key=OPENAI_API_KEY)


def obtener_datos_ia(datos: DatosVehiculo) -> RespuestaIA:
    """
    Llama al motor GPT con un prompt construido a partir de los datos del vehículo.
    Devuelve un objeto RespuestaIA con cilindrada, emisiones, tipo de motor, etc.
    """

    if not OPENAI_API_KEY:
        raise RuntimeError("Falta OPENAI_API_KEY en el archivo .env dentro de /BACKEND")

    # Construir prompt
    prompt = construir_prompt(datos)

    # Llamada a GPT
    respuesta = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    contenido = respuesta.choices[0].message.content

    # Intentar parsear JSON devuelto por la IA
    try:
        data = json.loads(contenido)
    except json.JSONDecodeError:
        raise ValueError(f"La IA devolvió un JSON inválido: {contenido}")

    # Convertir a modelo RespuestaIA
    return RespuestaIA(
        cilindrada=data.get("cilindrada"),
        emisiones_co2=data.get("emisiones_co2"),
        tipo_motor=data.get("tipo_motor"),
        version_descriptiva=data.get("version_descriptiva"),
        nivel_confianza=float(data.get("nivel_confianza", 0.0)),
        fuente="ia",
        mensaje="Datos estimados por IA. Confirma con la ficha técnica si lo necesitas."
    )

