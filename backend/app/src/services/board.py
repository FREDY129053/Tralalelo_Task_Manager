import backend.app.src.repository.board as BoardRepo

from typing import List, Optional
from uuid import UUID
from backend.app.src.schemas import FullBoardInfo, AbsoluteFullBoardInfo

async def get_all_boards() -> List[FullBoardInfo]: # type: ignore
  return await BoardRepo.get_all_boards()

async def get_board_data(uuid: UUID) -> Optional[AbsoluteFullBoardInfo]:
  board = await BoardRepo.get_board_data(uuid)
  if board is None:
    return None
  
  return AbsoluteFullBoardInfo(
    board=board,
    columns=board.columns,
  )