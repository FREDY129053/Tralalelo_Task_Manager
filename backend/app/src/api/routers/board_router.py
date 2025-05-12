import backend.app.src.services.board as BoardService

from uuid import UUID
from typing import List
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from backend.app.src.schemas import FullBoardInfo, AbsoluteFullBoardInfo

board_router = APIRouter(prefix='/boards', tags=["Boards Endpoints"])

@board_router.get('/', response_model=List[FullBoardInfo])
async def get_all_boards():
  return await BoardService.get_all_boards()

@board_router.get('/{uuid}', response_model=AbsoluteFullBoardInfo)
async def get_board_data(uuid: UUID):
  board_info = await BoardService.get_board_data(uuid)
  if board_info is None:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="board not found"
    )
  
  return board_info