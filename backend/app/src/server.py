# Здесь собирается приложение(app) из роутеров, инициализации БД и т.д.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import AsyncGenerator
from contextlib import asynccontextmanager

from backend.app.src.db import init_db_tortoise
from backend.app.src.api.routers import router

# Это инициализирует БД до запуска приложения(параметр lifespan)
@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
  await init_db_tortoise(_app)
  yield


def create_app() -> FastAPI:
  _app = FastAPI(
    title="Task Manager API",
    docs_url="/docs",
    lifespan=lifespan,
  )

  _app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  _app.include_router(router=router)

  return _app

app = create_app()