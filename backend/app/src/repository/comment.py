from uuid import UUID

from backend.app.src.db.models import Comment


async def delete_comment(id: UUID) -> bool:
    comment = await Comment.get_or_none(id=id)
    if not comment:
        return False
    await comment.delete()

    return True
