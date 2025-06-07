from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class CreateNotification(BaseModel):
    title: str
    text: str
    user_id: UUID

    class Config:
        from_attributes = True


class NotificationInfo(CreateNotification):
    id: int
    is_read: bool = False
    created_at: datetime


class UpdateNotification(BaseModel):
    is_read: Optional[bool] = None
    title: Optional[str] = None
    text: Optional[str] = None
    user_id: Optional[UUID] = None
