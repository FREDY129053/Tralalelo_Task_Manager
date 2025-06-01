from typing import List
from uuid import UUID

import backend.app.src.repository.task as TaskRepo
from backend.app.src.helpers.jwt import decode_jwt_token
from backend.app.src.schemas import CommentCreate, SubtaskCreate, TaskOut, TaskUpdate
from backend.app.src.schemas.board import UpdateTaskPos


async def delete_task(uuid: UUID) -> bool:
    return await TaskRepo.delete_task(uuid=uuid)


async def get_full_task(uuid: UUID) -> TaskOut | None:
    return await TaskRepo.get_full_task(id=uuid)


async def create_comment(uuid: UUID, comment_data: CommentCreate, token: str) -> bool:
    user_data = decode_jwt_token(token=token)
    if not user_data:
        return False

    comment = await TaskRepo.create_comment(
        task_id=uuid, user_id=user_data.get("uuid", ""), text=comment_data.content
    )

    return bool(comment)


async def create_subtask(uuid: UUID, subtask_data: SubtaskCreate) -> bool:
    task = await TaskRepo.get_task(uuid=uuid)
    if not task:
        return False

    subtask = await TaskRepo.create_subtask(
        task=task, title=subtask_data.title, is_completed=subtask_data.is_completed
    )

    return bool(subtask)


async def update_task_data(tasks_data: List[UpdateTaskPos]) -> bool:
    for new_task in tasks_data:
        await TaskRepo.update_task_pos(
            task_uuid=new_task.task_id,
            column_id=new_task.col_id,
            position=new_task.position,
        )

    return True


async def update_task_fields(task_id: UUID, fields: TaskUpdate) -> bool:
    data_to_update = fields.model_dump(exclude_unset=True)

    await TaskRepo.update_fields(task_id, data_to_update)

    return True
