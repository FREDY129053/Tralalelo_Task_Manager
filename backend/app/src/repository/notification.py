from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List
from uuid import UUID

from backend.app.src.db.models import Notification, Task
from backend.app.src.enums.role import UserRole
from backend.app.src.enums.status import Status


async def get_all() -> List[Notification]:
    return await Notification.all()


async def create_notification(title: str, text: str, user_id: UUID) -> Notification:
    return await Notification.create(title=title, text=text, user_id=user_id)


async def get_all_users_notifications(user_id: UUID) -> List[Notification]:
    return await Notification.filter(user_id=user_id).order_by("-created_at")


async def update_fields(notification_id: int, fields: Dict[str, Any]):
    notification = await Notification.get(id=notification_id)

    for key, val in fields.items():
        setattr(notification, key, val)

    return await notification.save(update_fields=list(fields.keys()))


async def delete_notification(id: int):
    notification = await Notification.get(id=id)
    await notification.delete()


async def check_due_dates() -> Dict[int, List[Dict[str, Any]]]:
    print(f"\033[034mCRON:\033[0m\t  {datetime.now(timezone.utc)}")
    today = datetime.now(timezone.utc).date()

    # Дни до дедлайна
    day_offsets = [7, 3, 2, 1, -1]
    tasks_by_days: Dict[int, List[Dict[str, Any]]] = {}

    for offset in day_offsets:
        date = today + timedelta(days=offset)
        tasks: List[Task] = await Task.filter(due_date=date).prefetch_related(
            "responsibles__user", "column__board__members__user"
        )

        for task in tasks:
            if task.status not in [Status.done, Status.reject]:
                board = task.column.board

                creator_user = None
                for member in board.members:
                    if member.role == UserRole.creator:
                        creator_user = member.user
                        break

                creator_id = creator_user.id if creator_user else None
                creator_email = creator_user.email if creator_user else None

                for responsible in task.responsibles:
                    entry = {
                        "task_name": task.title,
                        "column_name": task.column.title,
                        "board_name": board.title,
                        "board_id": board.id,
                        "user_id": responsible.user.id,
                        "user_email": responsible.user.email,
                        "creator_id": creator_id,
                        "creator_email": creator_email,
                        "due_offset": offset,
                    }
                    tasks_by_days.setdefault(offset, []).append(entry)

    return tasks_by_days
