import backend.app.src.repository.comment as CommentRepo
from uuid import UUID

async def delete_comment(uuid: UUID) -> bool:
  return await CommentRepo.delete_comment(id=uuid)