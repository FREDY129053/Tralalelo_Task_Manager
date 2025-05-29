from uuid import UUID

import backend.app.src.repository.comment as CommentRepo


async def delete_comment(uuid: UUID) -> bool:
    return await CommentRepo.delete_comment(id=uuid)
