from backend.app.src.db.models import Board

from uuid import UUID
from typing import List, Optional

async def get_all_boards() -> List[Board]:
  return await Board.all()

async def get_board_data(uuid: UUID) -> Optional[Board]:
  return await Board.get_or_none(id=uuid).prefetch_related(
    "columns__tasks__subtasks",
    "columns__tasks__comments"
  )