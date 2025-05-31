from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse

import backend.app.src.services.board as BoardService
from backend.app.src.enums import UserRole
from backend.app.src.schemas import (
    AbsoluteFullBoardInfo,
    ColumnOut,
    CommentCreate,
    CreateBoard,
    CreateColumn,
    FullBoardInfo,
)

board_router = APIRouter(prefix="/boards", tags=["Boards Endpoints"])


@board_router.get("/", response_model=List[FullBoardInfo])
async def get_all_boards():
    return await BoardService.get_all_boards()


@board_router.post("/")
async def create_board(request: Request, data: CreateBoard):
    token = request.cookies.get("user", None)
    if not token:
        raise HTTPException(status_code=401, detail="unauthorized")
    await BoardService.create_board(token=token, board_data=data)

    return JSONResponse(content={"message": "board created"}, status_code=201)


@board_router.post("/add_member")
async def add_member(user_id: UUID): ...


@board_router.delete("/delete_member")
async def delete_member(member_id: UUID): ...


@board_router.get("/members")
async def get_all_members(): ...


@board_router.put("/change_role/{user_id}")
async def change_role(user_id: UUID, role: UserRole): ...


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


@board_router.delete("/{uuid}")
async def delete_board(uuid: UUID): ...


@board_router.post("/{uuid}/comments")
async def write_comment(request: Request, uuid: UUID, comment_data: CommentCreate):
    is_created = await BoardService.write_comment(
        board_id=uuid, token=request.cookies.get("user", ""), text=comment_data.content
    )
    if not is_created:
        raise HTTPException(status_code=400, detail="invalid data")

    return JSONResponse(content={"message": "comment wrote"})


@board_router.get("/{uuid}/comments")
async def get_comments(uuid: UUID):
    return await BoardService.get_comments(uuid=uuid)
