from datetime import datetime
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
