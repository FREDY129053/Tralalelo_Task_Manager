from typing import Generic, TypeVar

from pydantic import BaseModel, Field


class Error(BaseModel):
    detail: str = Field(description="Описание ошибки")


class SuccessResponse(BaseModel):
    message: str | None = None


T = TypeVar("T")


class ServiceMessage(Generic[T]):
    def __init__(
        self,
        is_error: bool = False,
        message: T | str | None = None,
        status_code: int = 200,
    ):
        self.is_error = is_error
        self.message = message
        self.status_code = status_code
