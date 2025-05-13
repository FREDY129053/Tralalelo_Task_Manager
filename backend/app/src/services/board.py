import backend.app.src.repository.board as BoardRepo

from typing import List, Optional
from uuid import UUID
from backend.app.src.schemas import FullBoardInfo, AbsoluteFullBoardInfo, CreateColumn

async def get_all_boards() -> List[FullBoardInfo]:
  return await BoardRepo.get_all_boards()

async def get_full_board_data(uuid: UUID) -> Optional[AbsoluteFullBoardInfo]:
  board = await BoardRepo.get_full_board_data(uuid)
  if board is None:
    return None
  
  return AbsoluteFullBoardInfo(
    board=board,
    columns=board.columns,
  )

async def create_column(board_uuid: UUID, column_data: CreateColumn) -> bool:
  board = await BoardRepo.get_board(uuid=board_uuid)
  if not board:
    return False
  
  column = await BoardRepo.create_column(
    board=board,
    title=column_data.title,
    position=column_data.position,
    color=column_data.color,
  )

  return bool(column)