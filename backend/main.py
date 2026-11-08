
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.alarms import router as alarms_router
from routers.health import router as health_router


app = FastAPI(
    title="Sistema de Alarmas API",
    description="API para importar y visualizar alarmas",
    version="1.0.0"
)

# CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=False,
#     allow_methods=["*"],
#     allow_headers=["*"]
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://hitsstest-web.vercel.app",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health_router)
app.include_router(alarms_router)
