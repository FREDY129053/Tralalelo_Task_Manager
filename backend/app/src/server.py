# Здесь собирается приложение(app) из роутеров, инициализации БД и т.д.
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.src.api.routers import router
from backend.app.src.config import load_environment, validate_environment
from backend.app.src.db import init_db_tortoise
from backend.app.src.helpers.notification import notify_users

scheduler = AsyncIOScheduler()


# Это инициализирует БД до запуска приложения(параметр lifespan)
@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    load_environment()
    validate_environment()

    await init_db_tortoise(_app)

    scheduler.add_job(notify_users, CronTrigger(day="*/25"))
    # scheduler.add_job(notify_users, CronTrigger(second="*/25"))
    scheduler.start()
    yield


def create_app() -> FastAPI:
    _app = FastAPI(
        title="Task Manager API",
        docs_url="/docs",
        lifespan=lifespan,
    )

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _app.include_router(router=router)

    return _app


app = create_app()
