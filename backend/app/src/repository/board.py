from typing import List, Optional
from uuid import UUID

from tortoise.exceptions import IntegrityError

from backend.app.src.db.models import Board, BoardComment, BoardUser, Column
from backend.app.src.enums import UserRole
from backend.app.src.schemas import (
    AbsoluteFullBoardInfo,
    BoardUserPreview,
    ColumnOut,
    TaskShortOut,
)


async def get_all_boards() -> List[Board]:
    return await Board.all()


async def get_full_board_data(uuid: UUID) -> Optional[AbsoluteFullBoardInfo]:
    board = await Board.get_or_none(id=uuid).prefetch_related(
        "columns__tasks__subtasks",
    )

    if not board:
        return None

    columns_out = []
    for column in board.columns:
        tasks = []
        for task in column.tasks:
            subtasks = task.subtasks
            total = len(subtasks)
            completed = sum(1 for s in subtasks if s.is_completed)
            tasks.append(
                TaskShortOut(
                    id=task.id,
                    title=task.title,
                    position=task.position,
                    priority=task.priority.value,
                    status=task.status.value,
                    color=task.color,
                    completed_subtasks=completed,
                    total_subtasks=total,
                    responsible_id=task.responsible_id,
                    subtasks=subtasks,
                )
            )
            tasks.sort(key=lambda x: x.position)
        columns_out.append(
            ColumnOut(
                id=column.id,
                title=column.title,
                position=column.position,
                color=column.color,
                tasks=tasks,
            )
        )

    columns_out.sort(key=lambda x: x.position)

    return AbsoluteFullBoardInfo(board=board, columns=columns_out)


async def get_board(uuid: UUID) -> Optional[Board]:
    return await Board.get_or_none(id=uuid)


async def create_board(
    title: str,
    description: Optional[str],
    is_public: bool,
    color: Optional[str],
    creator_id: UUID,
) -> bool:
    try:
        board = await Board.create(
            title=title, description=description, is_public=is_public, color=color
        )
        await BoardUser.create(
            user_id=creator_id, board_id=board.id, role=UserRole.creator
        )

        return True
    except IntegrityError:
        return False


async def create_column(
    board: Board, title: str, position: int, color: Optional[str]
) -> Optional[Column]:
    try:
        return await Column.create(
            board=board, title=title, position=position, color=color
        )
    except IntegrityError:
        return None


async def get_comments(id: UUID):
    board = await Board.get(id=id).prefetch_related("comments")
    return await board.comments


async def create_comment(id: UUID, user_id: str, text: str) -> Optional[BoardComment]:
    try:
        return await BoardComment.create(user_id=UUID(user_id), board_id=id, content=text)
    except IntegrityError:
        return None


async def get_members(board_id: UUID) -> List[BoardUserPreview]:
    members_data = await Board.get(id=board_id).prefetch_related(
        "members", "members__user"
    )
    members = []
    for member in members_data.members:
        members.append(
            BoardUserPreview(
                id=member.user.id,
                username=member.user.username,
                avatar_url=member.user.avatar_url,
                role=member.role,
            )
        )
    return members


async def add_member(board_id: UUID, user_id: UUID) -> Optional[BoardUser]:
    try:
        return await BoardUser.create(board_id=board_id, user_id=user_id)
    except IntegrityError:
        return None


async def change_member_role(board_id: UUID, member_id: UUID, role: UserRole) -> bool:
    board_member = await BoardUser.get_or_none(board_id=board_id, user_id=member_id)
    if not board_member:
        return False
    board_member.role = role
    await board_member.save()

    return True


async def delete_member(board_id: UUID, member_id: UUID) -> bool:
    board_member = await BoardUser.get_or_none(board_id=board_id, user_id=member_id)
    if not board_member:
        return False
    await board_member.delete()

    return True


async def delete_board(id: UUID) -> bool:
    board = await Board.get_or_none(id=id)
    if not board:
        return False
    await board.delete()

    return True
