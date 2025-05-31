from typing import Any, Dict, Optional
from uuid import UUID

from tortoise.exceptions import OperationalError

from backend.app.src.db.models import Column, Comment, Subtask, Task
from backend.app.src.schemas import TaskOut


async def get_task(uuid: UUID) -> Optional[Task]:
    return await Task.get_or_none(id=uuid)


async def get_full_task(id: UUID) -> Optional[TaskOut]:
    task = await Task.get_or_none(id=id).prefetch_related("subtasks", "comments")
    if not task:
        return None

    return TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        position=task.position,
        due_date=task.due_date,
        priority=task.priority,
        status=task.status,
        color=task.color,
        responsible_id=task.responsible_id,
        total_subtasks=len(task.subtasks),
        completed_subtasks=sum(1 for s in task.subtasks if s.is_completed),
        subtasks=task.subtasks,
        comments=task.comments,
    )


async def delete_task(uuid: UUID) -> bool:
    task = await get_task(uuid=uuid)
    if not task:
        return False
    try:
        await task.delete()
        return True
    except OperationalError:
        return False


async def create_comment(task_id: UUID, user_id: str, text: str) -> Comment:
    return await Comment.create(task_id=task_id, user_id=UUID(user_id), content=text)


async def create_subtask(task: Task, title: str, is_completed: bool) -> Subtask:
    return await Subtask.create(
        task=task,
        title=title,
        is_completed=is_completed,
    )


async def update_task(task_uuid: UUID, column: Column, position: int):
    task = await Task.get(id=task_uuid)
    task.column = column
    task.position = position
    await task.save()


async def update_fields(task_id: UUID, fields: Dict[str, Any]):
    task = await Task.get(id=task_id)

    for key, val in fields.items():
        setattr(task, key, val)

    return await task.save(update_fields=list(fields.keys()))
