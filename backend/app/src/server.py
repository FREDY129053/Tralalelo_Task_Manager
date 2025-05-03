# Здесь собирается приложение(app) из роутеров, инициализации БД и т.д.
from fastapi import FastAPI
from typing import AsyncGenerator
from contextlib import asynccontextmanager

from app.src.db import init_db_tortoise

# Это инициализирует БД до запуска приложения(параметр lifespan)
@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
  await init_db_tortoise(_app)
  yield
