from typing import Any

from pydantic import BaseModel, Field


class Error(BaseModel):
    detail: str = Field(description="Описание ошибки")


class ServiceMessage(BaseModel):
    is_error: bool = False
    message: Any
    status_code: int = 200
