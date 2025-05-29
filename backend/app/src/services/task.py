from uuid import UUID

import backend.app.src.repository.column as ColumnRepo
import backend.app.src.repository.task as TaskRepo
import backend.app.src.repository.user as UserRepo
from backend.app.src.helpers.jwt import decode_jwt_token
from backend.app.src.schemas import CommentCreate, SubtaskCreate, TaskOut, TaskUpdate


async def delete_task(uuid: UUID) -> bool:
    return await TaskRepo.delete_task(uuid=uuid)


async def get_full_task(uuid: UUID) -> TaskOut | None:
    return await TaskRepo.get_full_task(id=uuid)


async def create_comment(uuid: UUID, comment_data: CommentCreate, token: str) -> bool:
    task = await TaskRepo.get_task(uuid=uuid)
    if not task:
        return False

    user_data = decode_jwt_token(token=token)
    if not user_data:
        return False

    user = await UserRepo.get_user_info(user_data.get("uuid", ""))
    if not user:
        return False

    comment = await TaskRepo.create_comment(
        task=task, user=user, text=comment_data.content
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


async def update_task_data(task_id: UUID, col_id: UUID, position: int) -> bool:
    column = await ColumnRepo.get_column(uuid=col_id)
    if not column:
        return False
    await TaskRepo.update_task(task_uuid=task_id, column=column, position=position)

    return True


async def update_task_fields(task_id: UUID, fields: TaskUpdate) -> bool:
    data_to_update = fields.model_dump(exclude_unset=True)

    await TaskRepo.update_fields(task_id, data_to_update)

    return True
