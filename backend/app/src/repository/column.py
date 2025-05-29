from datetime import datetime
from typing import Optional
from uuid import UUID

from tortoise.exceptions import OperationalError

from backend.app.src.db.models import Column, Task, User
from backend.app.src.enums import Priority, Status


async def get_column(uuid: UUID) -> Optional[Column]:
    return await Column.get_or_none(id=uuid)


async def delete_column_by_uuid(uuid: UUID) -> bool:
    column = await Column.get_or_none(id=uuid)

    if not column:
        return False

    try:
        await column.delete()
        return True
    except OperationalError:
        return False


async def create_task(
    column: Column,
    title: str,
    description: Optional[str],
    position: int,
    due_date: Optional[datetime],
    priority: Priority,
    status: Status,
    color: Optional[str],
    responsible: Optional[User],
) -> Task:
    return await Task.create(
        column=column,
        title=title,
        description=description,
        position=position,
        due_date=due_date,
        priority=priority,
        status=status,
        color=color,
        responsible=responsible,
    )


async def update_col_position(col_id: UUID, new_pos: int):
    return await Column.filter(id=col_id).update(position=new_pos)
