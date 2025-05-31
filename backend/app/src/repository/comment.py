from uuid import UUID

from backend.app.src.db.models import BoardComment, Comment


async def delete_comment(id: UUID) -> bool:
    comment = await Comment.get_or_none(id=id)
    board_comment = await BoardComment.get_or_none(id=id)
    if comment:
        await comment.delete()
        return True
    if board_comment:
        await board_comment.delete()
        return True

    return False
