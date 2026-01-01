from calculos.impuesto_matriculacion import calcular_impuesto_matriculacion
from calculos.iva_aranceles import calcular_iva_y_aranceles
from calculos.costos_fijos import calcular_costos_fijos

def calcular_coste_importacion(
    precio_base: float,
    emisiones_co2: float,
    pais_origen: str,
    iva_incluido: bool = False,
    incluir_gestoria: bool = True
) -> dict:
    """
    Motor final que combina:
    - Impuesto de matriculación
    - IVA + Aranceles
    - Costes fijos
    """

    # 1. Impuesto de matriculación
    matriculacion = calcular_impuesto_matriculacion(
        precio_base=precio_base,
        emisiones_co2=emisiones_co2
    )

    # 2. IVA + Aranceles
    iva_aranceles = calcular_iva_y_aranceles(
        precio_base=precio_base,
        pais_origen=pais_origen,
        iva_incluido=iva_incluido
    )

    # 3. Costes fijos
    costos_fijos = calcular_costos_fijos(
        incluir_gestoria=incluir_gestoria
    )

    # 4. Total final
    total = (
        matriculacion["importe"] +
        iva_aranceles["iva_importe"] +
        iva_aranceles["arancel_importe"] +
        costos_fijos["total_costos_fijos"]
    )

    return {
        "precio_base": precio_base,
        "emisiones_co2": emisiones_co2,
        "pais_origen": pais_origen,
        "iva_incluido": iva_incluido,

        "impuesto_matriculacion": matriculacion,
        "iva_y_aranceles": iva_aranceles,
        "costos_fijos": costos_fijos,

        "total_final": round(total, 2),
        "mensaje": "Cálculo completo realizado correctamente."
    }
