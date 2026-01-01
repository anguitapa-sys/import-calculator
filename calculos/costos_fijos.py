def calcular_costos_fijos(incluir_gestoria: bool = True) -> dict:
    """
    Calcula los costos fijos asociados a la importación:
    - ITV
    - Tasas DGT
    - Permiso de circulación
    - Gestoría (opcional)
    """

    tasa_dgt = 99.77
    permiso_circulacion = 20.00
    itv_importacion = 180.00  # valor medio

    # Gestoría opcional
    gestoria = 120.00 if incluir_gestoria else 0.00

    total = tasa_dgt + permiso_circulacion + itv_importacion + gestoria

    return {
        "tasa_dgt": tasa_dgt,
        "permiso_circulacion": permiso_circulacion,
        "itv_importacion": itv_importacion,
        "gestoria": gestoria,
        "total_costos_fijos": round(total, 2),
        "mensaje": "Cálculo de costos fijos completado."
    }
