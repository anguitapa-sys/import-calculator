def calcular_impuesto_matriculacion(precio_base: float, emisiones_co2: float) -> dict:
    """
    Calcula el impuesto de matriculación según las emisiones de CO₂.
    Devuelve el porcentaje aplicado y el importe final.
    """

    if emisiones_co2 is None:
        return {
            "porcentaje": None,
            "importe": None,
            "mensaje": "No se pueden calcular las emisiones porque no se proporcionaron."
        }

    # Tramos oficiales
    if emisiones_co2 <= 120:
        porcentaje = 0.00
    elif emisiones_co2 <= 160:
        porcentaje = 0.0475
    elif emisiones_co2 <= 200:
        porcentaje = 0.0975
    else:
        porcentaje = 0.1475

    importe = precio_base * porcentaje

    return {
        "porcentaje": porcentaje,
        "importe": round(importe, 2),
        "mensaje": "Cálculo realizado correctamente."
    }
