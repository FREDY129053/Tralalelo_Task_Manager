from fastapi import FastAPI
from tortoise import Tortoise
from tortoise.contrib.fastapi import register_tortoise


async def init_db_tortoise(_app: FastAPI):

    TORTOISE_ORM = {
        "connections": {"default": "postgres://postgres:12345@main_db:5432/tralalelo_db"},
        # "connections": {
        #     "default": "postgres://postgres:12345@localhost:5433/tralalelo_db"
        # },
        "apps": {
            "models": {
                "models": ["backend.app.src.db.models"],
                "default_connection": "default",
            }
        },
    }

    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()

    register_tortoise(
        app=_app,
        config=TORTOISE_ORM,
    )
