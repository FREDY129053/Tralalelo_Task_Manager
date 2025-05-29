from uuid import UUID
import backend.app.src.repository.subtask as SubtaskRepo
from backend.app.src.schemas import SubtaskUpdate

async def delete_subtask(uuid: UUID) -> bool:
  return await SubtaskRepo.delete_subtask(id=uuid)

async def update_subtask(id: UUID, data: SubtaskUpdate):
  update_data = data.model_dump(exclude_unset=True)
  await SubtaskRepo.update_fields(subtask_id=id, fields=update_data)

  return True