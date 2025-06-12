from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse

import backend.app.src.services.board as BoardService
from backend.app.src.enums import UserRole
from backend.app.src.schemas import (
    AbsoluteFullBoardInfo,
    AllowBoard,
    ColumnOut,
    CommentCreate,
    CreateBoard,
    CreateColumn,
    FullBoardInfo,
    UpdateBoard,
)

board_router = APIRouter(prefix="/boards", tags=["Boards Endpoints"])


@board_router.get("/", response_model=List[FullBoardInfo])
async def get_all_boards():
    result = await BoardService.get_all_boards()

    return result.message


@board_router.get("/include_users", response_model=List[AllowBoard])
async def get_all_users_in_boards(request: Request):
    token = request.cookies.get("user", None)
    if not token:
        raise HTTPException(status_code=401, detail="unauthorized")

    result = await BoardService.get_users_in_boards(token=token)

    if result.is_error:
        raise HTTPException(status_code=result.status_code, detail=result.message)

    return result.message


@board_router.post("/")
async def create_board(request: Request, data: CreateBoard):
    token = request.cookies.get("user", None)
    if not token:
        raise HTTPException(status_code=401, detail="unauthorized")

    result = await BoardService.create_board(token=token, board_data=data)

    if result.is_error:
        raise HTTPException(status_code=result.status_code, detail=result.message)

    return JSONResponse(
        content={"message": result.message}, status_code=result.status_code
    )


@board_router.post("/{uuid}/add_member")
async def add_member(uuid: UUID, user_id: UUID):
    res = await BoardService.add_member(board_id=uuid, user_id=user_id)
    if res.is_error:
        raise HTTPException(status_code=res.status_code, detail=res.message)

    return JSONResponse(content={"message": res.message}, status_code=res.status_code)


@board_router.delete("/{uuid}/delete_member")
async def delete_member(uuid: UUID, member_id: UUID):
    res = await BoardService.delete_member(
        board_id=uuid,
        user_id=member_id,
    )
    if res.is_error:
        raise HTTPException(status_code=res.status_code, detail=res.message)

    return JSONResponse(content={"message": res.message}, status_code=res.status_code)


@board_router.get("/{uuid}/members")
async def get_all_members(uuid: UUID):
    result = await BoardService.get_members(id=uuid)

    return result.message


@board_router.put("/{uuid}/change_role/{user_id}")
async def change_role(uuid: UUID, user_id: UUID, role: UserRole):
    res = await BoardService.change_role(board_id=uuid, user_id=user_id, role=role)
    if res.is_error:
        raise HTTPException(status_code=res.status_code, detail=res.message)

    return JSONResponse(content={"message": res.message}, status_code=res.status_code)


@board_router.get("/{uuid}", response_model=AbsoluteFullBoardInfo)
async def get_board_data(uuid: UUID):
    result = await BoardService.get_full_board_data(uuid=uuid)
    if result.is_error:
        raise HTTPException(status_code=result.status_code, detail=result.message)

    return result.message


@board_router.get("/{uuid}/columns", response_model=List[ColumnOut])
async def get_board_columns_data(uuid: UUID):
    result = await BoardService.get_board_column_data(uuid)
    if result.is_error:
        raise HTTPException(status_code=result.status_code, detail=result.message)

    return result.message


@board_router.post("/{board_uuid}/columns")
async def create_column(board_uuid: UUID, column_data: CreateColumn):
    result = await BoardService.create_column(
        board_uuid=board_uuid, column_data=column_data
    )
    if result.is_error:
        raise HTTPException(
            status_code=result.status_code,
            detail=result.message,
        )

    return JSONResponse(
        content={"message": result.message}, status_code=result.status_code
    )


@board_router.patch("/{uuid}/info")
async def update_board_info(uuid: UUID, data: UpdateBoard):
    res = await BoardService.update_board_fields(uuid, data)

    if not res:
        raise HTTPException(status_code=400, detail="troubles")

    return JSONResponse(
        content={"message": "ok"},
    )


@board_router.delete("/{uuid}")
async def delete_board(uuid: UUID):
    res = await BoardService.delete_board(uuid)
    if res.is_error:
        raise HTTPException(status_code=res.status_code, detail=res.message)

    return JSONResponse(content={"message": res.message}, status_code=res.status_code)


@board_router.post("/{uuid}/comments")
async def write_comment(request: Request, uuid: UUID, comment_data: CommentCreate):
    token = request.cookies.get("user", None)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="unauthorized"
        )

    result = await BoardService.write_comment(
        board_id=uuid, token=token, text=comment_data.content
    )
    if result.is_error:
        raise HTTPException(status_code=result.status_code, detail=result.message)

    return JSONResponse(
        content={"message": result.message}, status_code=result.status_code
    )


@board_router.get("/{uuid}/comments")
async def get_comments(uuid: UUID):
    result = await BoardService.get_comments(uuid=uuid)

    return result.message
