from typing import List

import backend.app.src.repository.notification as NotificationRepo
from backend.app.src.helpers.jwt import decode_jwt_token
from backend.app.src.schemas.notifications import (
    CreateNotification,
    NotificationInfo,
    UpdateNotification,
)


async def get_all_notifications() -> List[NotificationInfo]:
    return await NotificationRepo.get_all()


async def get_all_users_notifications(token: str) -> List[NotificationInfo]:
    user_data = decode_jwt_token(token=token)

    return await NotificationRepo.get_all_users_notifications(user_data["uuid"])


async def create_notification(notification: CreateNotification) -> bool:
    await NotificationRepo.create_notification(
        title=notification.title, text=notification.text, user_id=notification.user_id
    )

    return True


async def update_fields(id: int, fields: UpdateNotification) -> bool:
    data_to_update = fields.model_dump(exclude_unset=True)

    await NotificationRepo.update_fields(notification_id=id, fields=data_to_update)

    return True


async def delete_notification(id: int):
    return await NotificationRepo.delete_notification(id)
