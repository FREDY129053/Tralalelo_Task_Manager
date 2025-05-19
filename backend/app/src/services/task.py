from uuid import UUID

import backend.app.src.repository.task as TaskRepo
import backend.app.src.repository.user as UserRepo
import backend.app.src.repository.column as ColumnRepo
from backend.app.src.schemas import SubtaskCreate, CommentCreate
from backend.app.src.helpers.jwt import decode_jwt_token

async def delete_task(uuid: UUID) -> bool:
  return await TaskRepo.delete_task(uuid=uuid)

# TODO: нормальные ошибки, а не bool!!!
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
    task=task,
    user=user,
    text=comment_data.content
  )

  return bool(comment)

async def create_subtask(uuid: UUID, subtask_data: SubtaskCreate) -> bool:
  task = await TaskRepo.get_task(uuid=uuid)
  if not task:
    return False
  
  subtask = await TaskRepo.create_subtask(
    task=task,
    title=subtask_data.title,
    is_completed=subtask_data.is_completed
  )

  return bool(subtask)

async def update_task_data(task_id: UUID, col_id: UUID) -> bool:
  column = await ColumnRepo.get_column(uuid=col_id)
  if not column:
    return False
  await TaskRepo.update_task(task_uuid=task_id, column=column)

  return True