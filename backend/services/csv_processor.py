import pandas as pd
from io import BytesIO



def process_csv(file_content):
    # 1. Lectura del archivo CSV
    try:
        df = pd.read_csv(
            BytesIO(file_content), #Convierte los bytes recibidos del frontend en un objeto que se comporta como un archivo en memoria.
            sep="|",
            encoding="utf-8-sig",
            dtype=str
        )
    except UnicodeDecodeError:
        df = pd.read_csv(
            BytesIO(file_content),
            sep="|",
            encoding="latin-1",
            dtype=str
        )

    # 2. Limpieza de encabezados
    df.columns = (df.columns.str.strip().str.upper())

    # 3. Limpieza general de valores
    df.replace(
        {
            "nan": "",
            "None": "",
            "NaN": ""
        },
        inplace=True
    )

    # 4. Conversión de columnas 2G, 3G y 4G
    for column in ["2G", "3G", "4G"]:
        if column in df.columns:
            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

    return df



def calculate_duration(df):

    result = df.copy()

    # 1. Verificar que exista la columna de fecha
    if "FECHA_CREACION" not in result.columns:
        result["DURACION_ACUMULADA"] = "Fecha no disponible"
        return result

    # 2. Normalizar los meses en inglés a números
    meses = {
        "JAN": "01", "FEB": "02", "MAR": "03",
        "APR": "04", "MAY": "05", "JUN": "06",
        "JUL": "07", "AUG": "08", "SEP": "09",
        "OCT": "10", "NOV": "11", "DEC": "12"
    }

    fechas = result["FECHA_CREACION"].str.strip().str.upper()

    for mes, numero in meses.items():
        fechas = fechas.str.replace(
            f"-{mes}-",
            f"-{numero}-",
            regex=False
        )

    # 3. Convertir las fechas a datetime
    dates = pd.to_datetime(
        fechas,
        format="%d-%m-%y %I.%M.%S.%f %p",
        errors="coerce"
    )

    # 4. Calcular duración
    def format_duration(date):

        if pd.isna(date):
            return "Fecha inválida"

        current_time = pd.Timestamp.now()

        total_seconds = max(
            0,
            int((current_time - date).total_seconds())
        )

        days, remainder = divmod(total_seconds, 86400)
        hours, remainder = divmod(remainder, 3600)
        minutes, seconds = divmod(remainder, 60)

        return f"{days}d {hours}h {minutes}m {seconds}s"

    # 5. Crear columna de duración
    result["DURACION_ACUMULADA"] = dates.apply(format_duration)

    return result



def alert_level(df):

    result = df.copy()

    # 1. Verificar columnas necesarias
    required_columns = [
        "2G",
        "3G",
        "4G",
        "NOTIFICADA",
        "FECHA_CREACION"
    ]

    for column in required_columns:
        if column not in result.columns:
            result["ALERT_LEVEL"] = "N/A"
            return result

    # 2. Validar disponibilidad de tecnologías
    technologies = ["2G", "3G", "4G"]

    # Todas las tecnologías deben ser >= 0
    available = result[technologies].ge(0).all(axis=1)

    # Al menos una tecnología debe ser exactamente 100
    at_limit = result[technologies].eq(100).any(axis=1)

    # 3. Validar estado de notificación
    not_notified = (
        result["NOTIFICADA"]
        .astype(str)
        .str.strip()
        .str.upper()
        .eq("N")
    )

    # 4. Interpretar FECHA_CREACION
    meses = {
        "JAN": "01", "FEB": "02", "MAR": "03",
        "APR": "04", "MAY": "05", "JUN": "06",
        "JUL": "07", "AUG": "08", "SEP": "09",
        "OCT": "10", "NOV": "11", "DEC": "12"
    }

    fechas = (
        result["FECHA_CREACION"]
        .astype(str)
        .str.strip()
        .str.upper()
    )

    for mes, numero in meses.items():
        fechas = fechas.str.replace(
            f"-{mes}-",
            f"-{numero}-",
            regex=False
        )

    dates = pd.to_datetime(
        fechas,
        format="%d-%m-%y %I.%M.%S.%f %p",
        errors="coerce"
    )

    # 5. Calcular tiempo transcurrido
    now = pd.Timestamp.now()

    elapsed = now - dates

    # 6. Condiciones base
    base_conditions = (
        available
        & at_limit
        & not_notified
    )

    # 7. Clasificar alertas
    warn = (
        base_conditions
        & (elapsed > pd.Timedelta(hours=1))
        & (elapsed <= pd.Timedelta(hours=24))
    )

    critical = (
        base_conditions
        & (elapsed > pd.Timedelta(hours=24))
    )

    # 8. Crear columna ALERT_LEVEL
    result["ALERT_LEVEL"] = ""

    result.loc[warn, "ALERT_LEVEL"] = "WARN"

    result.loc[critical, "ALERT_LEVEL"] = "CRITICO"

    return result
