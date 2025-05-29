from pydantic import BaseModel, Field


class Error(BaseModel):
    detail: str = Field(description="Описание ошибки")
