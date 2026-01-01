def calcular_iva_y_aranceles(precio_base: float, pais_origen: str, iva_incluido: bool) -> dict:
    """
    Calcula aranceles e IVA según país de origen y si el IVA ya está incluido.
    """

    pais_origen = pais_origen.lower()

    paises_ue = [
        "alemania", "francia", "italia", "portugal", "belgica", "paises bajos",
        "holanda", "luxemburgo", "austria", "dinamarca", "finlandia", "suecia",
        "irlanda", "grecia", "polonia", "chequia", "republica checa", "hungria",
        "eslovaquia", "eslovenia", "letonia", "lituania", "estonia", "croacia",
        "bulgaria", "rumania", "malta", "chipre", "españa"
    ]

    # ARANCEL
    if pais_origen in paises_ue:
        porcentaje_arancel = 0.00
    else:
        porcentaje_arancel = 0.10

    arancel = precio_base * porcentaje_arancel

    # IVA
    if iva_incluido:
        porcentaje_iva = 0.00
        iva = 0.00
        base_iva = precio_base
        mensaje_iva = "IVA ya incluido en el precio de origen."
    else:
        porcentaje_iva = 0.21
        base_iva = precio_base + arancel
        iva = base_iva * porcentaje_iva
        mensaje_iva = "IVA calculado según normativa española."

    return {
        "arancel_porcentaje": porcentaje_arancel,
        "arancel_importe": round(arancel, 2),
        "iva_porcentaje": porcentaje_iva,
        "iva_importe": round(iva, 2),
        "base_iva": round(base_iva, 2),
        "mensaje": mensaje_iva
    }
