from uuid import UUID
from typing import Optional
from tortoise.exceptions import OperationalError

from backend.app.src.db.models import Task, User, Comment, Subtask, Column

async def get_task(uuid: UUID) -> Optional[Task]:
  return await Task.get_or_none(id=uuid)

async def delete_task(uuid: UUID) -> bool:
  task = await get_task(uuid=uuid)
  if not task:
    return False
  try:
      await task.delete()
      return True
  except OperationalError:
      return False
  
async def create_comment(task: Task, user: User, text: str) -> Comment:
   return await Comment.create(
      task=task,
      user=user,
      content=text
   )

async def create_subtask(task: Task, title: str, is_completed: bool) -> Subtask:
   return await Subtask.create(
      task=task,
      title=title,
      is_completed=is_completed,
   )

async def update_task(task_uuid: UUID, column: Column):
   task = await Task.get(id=task_uuid)
   task.column = column
   await task.save()