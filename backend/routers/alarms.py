
from fastapi import APIRouter, HTTPException, Request
import pandas as pd

from services.csv_processor import process_csv
from services.alarm_service import IMPORTED_CSV, get_processed_alarms, get_today_summary


router = APIRouter(
    prefix="/api/alarms",
    tags=["Alarms"]
)



@router.post("/import")
async def import_csv(request: Request):
    filename = request.headers.get(
        "X-Filename",
        "alarmas.csv"
    )

    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="El archivo debe tener extensión CSV"
        )

    content = await request.body()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="El archivo está vacío"
        )

    try:
        df = process_csv(content)

        if df.empty:
            raise ValueError("El CSV no contiene registros")

        with open(IMPORTED_CSV, "wb") as file:
            file.write(content)

        return {
            "message": "Archivo importado correctamente",
            "filename": filename,
            "total_records": len(df),
            "columns": list(df.columns)
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Error al importar el archivo: {str(error)}"
        )



# CONSULTAR ALARMAS
@router.get("")
def get_alarms():
    df = get_processed_alarms()
    if df is None:
        return {
            "total": 0,
            "columns": [],
            "data": []
        }

    df = df.astype(object).where(
        pd.notna(df),
        None
    )

    records = df.to_dict(orient="records")

    return {
        "total": len(records),
        "columns": list(df.columns),
        "data": records
    }



# RESUMEN DEL DÍA
@router.get("/summary/today")
def today_summary():
    return get_today_summary()
