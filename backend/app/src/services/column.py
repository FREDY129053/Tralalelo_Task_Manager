from typing import List, Optional
from uuid import UUID

import backend.app.src.repository.column as ColumnRepo
import backend.app.src.repository.user as UserRepo
from backend.app.src.schemas import TaskCreate, UpdateColumnsPos
from backend.app.src.schemas.board import UpdateColumn


async def delete_column(uuid: UUID) -> bool:
    return await ColumnRepo.delete_column_by_uuid(uuid=uuid)


async def create_task(uuid: UUID, task_data: TaskCreate) -> Optional[UUID]:
    column = await ColumnRepo.get_column(uuid=uuid)
    if not column:
        print(1)
        return None

    user = None
    if task_data.responsible:
        print(2)
        user = await UserRepo.get_user_info(uuid=task_data.responsible)
        if not user:
            print(3)
            return None

    task = await ColumnRepo.create_task(
        column=column,
        title=task_data.title,
        description=task_data.description,
        position=task_data.position,
        due_date=task_data.due_date,
        priority=task_data.priority,
        status=task_data.status,
        color=task_data.color,
        responsible=user,
    )

    return task.id


async def update_cols_positions(data: List[UpdateColumnsPos]) -> bool:
    for col_data in data:
        await ColumnRepo.update_col_position(
            col_id=col_data.col_id, new_pos=col_data.new_pos
        )

    return True


async def update_column_fields(column_id: UUID, fields: UpdateColumn) -> bool:
    data_to_update = fields.model_dump(exclude_unset=True)

    await ColumnRepo.update_fields(column_id, data_to_update)

    return True
