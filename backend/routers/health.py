
from fastapi import APIRouter

router = APIRouter(
    tags=["Health"]
)


@router.get("/api/health")
def comprobar_backend():
    return {
        "status": "ok",
        "message": "Backend funcionando correctamente"
    }
