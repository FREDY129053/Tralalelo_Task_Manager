from typing import List, Optional
from uuid import UUID

from backend.app.src.db.models import Board, BoardComment, Column
from backend.app.src.schemas import AbsoluteFullBoardInfo, ColumnOut, TaskShortOut


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
        columns_out.append(
            ColumnOut(
                id=column.id,
                title=column.title,
                position=column.position,
                color=column.color,
                tasks=tasks,
            )
        )

    return AbsoluteFullBoardInfo(board=board, columns=columns_out)


async def get_board(uuid: UUID) -> Optional[Board]:
    return await Board.get_or_none(id=uuid)


async def create_column(
    board: Board, title: str, position: int, color: Optional[str]
) -> Column:
    return await Column.create(board=board, title=title, position=position, color=color)


async def get_comments(id: UUID):
    board = await Board.get(id=id).prefetch_related("comments")
    return await board.comments


async def create_comment(id: UUID, user_id: str, text: str) -> BoardComment:
    return await BoardComment.create(user_id=UUID(user_id), board_id=id, content=text)
