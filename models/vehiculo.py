from pydantic import BaseModel
from typing import Optional

class DatosVehiculo(BaseModel):
    marca: str
    modelo: str
    anio: int
    potencia_cv: float
    combustible: str  # "G" gasolina, "D" diésel

    cilindrada: Optional[float] = None
    emisiones: Optional[float] = None
    carroceria: Optional[str] = None
    caja_cambios: Optional[str] = None


class RespuestaIA(BaseModel):
    cilindrada: Optional[float]
    emisiones_co2: Optional[float]
    tipo_motor: Optional[str]
    version_descriptiva: Optional[str]
    nivel_confianza: float

    fuente: str
    mensaje: str
