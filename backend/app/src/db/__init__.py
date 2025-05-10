from fastapi import FastAPI
from tortoise import Tortoise
from tortoise.contrib.fastapi import register_tortoise

TORTOISE_ORM = {
    "connections": {"default": "postgres://postgres:12345@main_db:5432/tralalelo_db"},
    "apps": {
        "models": {
          "models": ["backend.app.src.db.models"],
          "default_connection": "default",
        }
    },
    "logging": True,
}


async def init_db_tortoise(_app: FastAPI):
    await Tortoise.init(config=TORTOISE_ORM)
    
    register_tortoise(
      app=_app,
      config=TORTOISE_ORM,
    )
