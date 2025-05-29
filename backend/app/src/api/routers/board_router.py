from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

import backend.app.src.services.board as BoardService
from backend.app.src.schemas import (
    AbsoluteFullBoardInfo,
    ColumnOut,
    CreateColumn,
    FullBoardInfo,
)

board_router = APIRouter(prefix="/boards", tags=["Boards Endpoints"])


@board_router.get("/", response_model=List[FullBoardInfo])
async def get_all_boards():
    return await BoardService.get_all_boards()


# @board_router.post("/")
# async def create_board(): ...


@board_router.get("/{uuid}", response_model=AbsoluteFullBoardInfo)
async def get_board_data(uuid: UUID):
    board_info = await BoardService.get_full_board_data(uuid)
    if board_info is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="board not found"
        )

    return board_info


@board_router.get("/{uuid}/columns", response_model=List[ColumnOut])
async def get_board_columns_data(uuid: UUID):
    board_info = await BoardService.get_board_column_data(uuid)

    return board_info


@board_router.post("/{board_uuid}/columns")
async def create_column(board_uuid: UUID, column_data: CreateColumn):
    column_uuid = await BoardService.create_column(
        board_uuid=board_uuid, column_data=column_data
    )
    if not column_uuid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="invalid data or board not found",
        )

    return JSONResponse(content={"message": "ok"}, status_code=status.HTTP_201_CREATED)


# @board_router.delete("/{uuid}")
# async def delete_board(uuid: UUID): ...


# @board_router.post("/{uuid}/comments")
# async def write_comment(uuid: UUID): ...


@board_router.get("/{uuid}/comments")
async def get_comments(uuid: UUID):
    return await BoardService.get_comments(uuid=uuid)
