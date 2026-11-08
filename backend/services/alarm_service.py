
import os
import pandas as pd

from fastapi import HTTPException

from services.csv_processor import process_csv, calculate_duration, alert_level



BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATA_DIR = os.path.join(BASE_DIR, "data")

os.makedirs(DATA_DIR, exist_ok=True)

IMPORTED_CSV = os.path.join(DATA_DIR,"imported_alarms.csv")



# CARGAR ALARMAS
def load_alarm_data():
    if not os.path.exists(IMPORTED_CSV):
        return None

    try:
        with open(IMPORTED_CSV, "rb") as file:
            content = file.read()
        return process_csv(content)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando el CSV: {str(error)}"
        )


# INTERPRETAR FECHAS
def parse_alarm_dates(df):
    if "FECHA_CREACION" not in df.columns:
        raise HTTPException(
            status_code=400,
            detail="No existe la columna FECHA_CREACION"
        )

    meses = {
        "JAN": "01", "FEB": "02", "MAR": "03",
        "APR": "04", "MAY": "05", "JUN": "06",
        "JUL": "07", "AUG": "08", "SEP": "09",
        "OCT": "10", "NOV": "11", "DEC": "12"
    }

    fechas = (
        df["FECHA_CREACION"]
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

    return pd.to_datetime(
        fechas,
        format="%d-%m-%y %I.%M.%S.%f %p",
        errors="coerce"
    )



# OBTENER ALARMAS PROCESADAS
def get_processed_alarms():
    df = load_alarm_data()
    if df is None:
        return None

    df = calculate_duration(df)
    df = alert_level(df)

    return df



# RESUMEN DEL DÍA
def get_today_summary():
    df = load_alarm_data()
    today = pd.Timestamp.now().date()
    if df is None:
        return {
            "date": today.strftime("%Y-%m-%d"),
            "total": 0,
            "hours": [
                {"hour": f"{hour:02d}:00", "count": 0}
                for hour in range(24)
            ]
        }
    dates = parse_alarm_dates(df)
    today_mask = dates.dt.date == today
    today_dates = dates.loc[today_mask]
    hourly_counts = (
        today_dates.dt.hour
        .value_counts()
        .sort_index()
    )

    hours = [
        {
            "hour": f"{hour:02d}:00",
            "count": int(hourly_counts.get(hour, 0))
        }
        for hour in range(24)
    ]

    return {
        "date": today.strftime("%Y-%m-%d"),
        "total": int(today_mask.sum()),
        "hours": hours
    }
