from backend.app.src.db.models import Board, Column

from uuid import UUID
from typing import List, Optional

async def get_all_boards() -> List[Board]:
  return await Board.all()

async def get_full_board_data(uuid: UUID) -> Optional[Board]:
  return await Board.get_or_none(id=uuid).prefetch_related(
    "columns__tasks__subtasks",
  )

async def get_board(uuid: UUID) -> Optional[Board]:
  return await Board.get_or_none(id=uuid)

async def create_column(board: Board, title: str, position: int, color: Optional[str]) -> Column:
  return await Column.create(
    board=board,
    title=title,
    position=position,
    color=color
  )