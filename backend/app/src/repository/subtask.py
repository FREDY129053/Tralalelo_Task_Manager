from typing import Any, Dict
from backend.app.src.db.models import Subtask
from uuid import UUID

async def delete_subtask(id: UUID) -> bool:
  subtask = await Subtask.get_or_none(id=id)
  if not subtask:
    return False
  await subtask.delete()

  return True

async def update_fields(subtask_id: UUID, fields: Dict[str, Any]):
   subtask = await Subtask.get(id=subtask_id)

   for key, val in fields.items():
      setattr(subtask, key, val)

   return await subtask.save(update_fields=list(fields.keys()))