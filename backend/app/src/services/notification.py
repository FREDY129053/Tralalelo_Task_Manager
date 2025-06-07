from typing import List

import backend.app.src.repository.notification as NotificationRepo
from backend.app.src.schemas.notifications import CreateNotification, NotificationInfo


async def get_all_notifications() -> List[NotificationInfo]:
    return await NotificationRepo.get_all()


async def create_notification(notification: CreateNotification) -> bool:
    await NotificationRepo.create_notification(
        title=notification.title, text=notification.text, user_id=notification.user_id
    )

    return True
