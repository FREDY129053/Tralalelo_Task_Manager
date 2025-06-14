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
from backend.app.src.schemas.board import CommentData
from backend.app.src.schemas.service_response import Error, SuccessResponse
from backend.app.src.schemas.user import BoardUserPreview

board_router = APIRouter(prefix="/boards", tags=["Boards Endpoints"])


@board_router.get(
    "/",
    response_model=List[FullBoardInfo],
    responses={
        200: {
            "description": "Список всех досок",
        },
        404: {
            "description": "Доски не найдены",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def get_all_boards():
    result = await BoardService.get_all_boards()

    return result.message


@board_router.get(
    "/include_users",
    response_model=List[AllowBoard],
    responses={
        200: {
            "description": "Список досок с пользователями",
        },
        401: {
            "description": "Unauthorized",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def get_all_users_in_boards(request: Request):
    token = request.cookies.get("user", None)
    if not token:
        raise HTTPException(status_code=401, detail="unauthorized")

    result = await BoardService.get_users_in_boards(token=token)

    if result.is_error:
        raise HTTPException(status_code=result.status_code, detail=result.message)

    return result.message


@board_router.get("/my", response_model=List[FullBoardInfo])
async def get_all_users_boards(request: Request):
    token = request.cookies.get("user", None)
    if not token:
        raise HTTPException(status_code=401, detail="unauthorized")

    result = await BoardService.get_users_boards(token=token)

    if result.is_error:
        raise HTTPException(status_code=result.status_code, detail=result.message)

    return result.message


@board_router.post(
    "/",
    responses={
        201: {
            "description": "Доска успешно создана",
            "content": {
                "application/json": {"schema": SuccessResponse.model_json_schema()}
            },
        },
        400: {
            "description": "Некорректные данные доски",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
        401: {
            "description": "Unauthorized",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
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


@board_router.post(
    "/{uuid}/add_member",
    responses={
        201: {
            "description": "Участник добавлен",
            "content": {
                "application/json": {"schema": SuccessResponse.model_json_schema()}
            },
        },
        400: {
            "description": "Ошибка добавления участника",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def add_member(uuid: UUID, user_id: UUID):
    res = await BoardService.add_member(board_id=uuid, user_id=user_id)
    if res.is_error:
        raise HTTPException(status_code=res.status_code, detail=res.message)

    return JSONResponse(content={"message": res.message}, status_code=res.status_code)


@board_router.delete(
    "/{uuid}/delete_member",
    responses={
        200: {
            "description": "Участник удалён",
            "content": {
                "application/json": {"schema": SuccessResponse.model_json_schema()}
            },
        },
        404: {
            "description": "Доска или пользователь не найдены",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def delete_member(uuid: UUID, member_id: UUID):
    res = await BoardService.delete_member(
        board_id=uuid,
        user_id=member_id,
    )
    if res.is_error:
        raise HTTPException(status_code=res.status_code, detail=res.message)

    return JSONResponse(content={"message": res.message}, status_code=res.status_code)


@board_router.get(
    "/{uuid}/members",
    response_model=List[BoardUserPreview],
    responses={
        200: {
            "description": "Список участников доски",
        },
    },
)
async def get_all_members(uuid: UUID):
    result = await BoardService.get_members(id=uuid)

    return result.message


@board_router.put(
    "/{uuid}/change_role/{user_id}",
    responses={
        200: {
            "description": "Роль изменена",
            "content": {
                "application/json": {"schema": SuccessResponse.model_json_schema()}
            },
        },
        404: {
            "description": "Доска или пользователь не найдены",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def change_role(uuid: UUID, user_id: UUID, role: UserRole):
    res = await BoardService.change_role(board_id=uuid, user_id=user_id, role=role)
    if res.is_error:
        raise HTTPException(status_code=res.status_code, detail=res.message)

    return JSONResponse(content={"message": res.message}, status_code=res.status_code)


@board_router.get(
    "/{uuid}",
    response_model=AbsoluteFullBoardInfo,
    responses={
        200: {
            "description": "Данные доски",
            "content": {
                "application/json": {"schema": AbsoluteFullBoardInfo.model_json_schema()}
            },
        },
        404: {
            "description": "Доска не найдена",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def get_board_data(uuid: UUID):
    result = await BoardService.get_full_board_data(uuid=uuid)
    if result.is_error:
        raise HTTPException(status_code=result.status_code, detail=result.message)

    return result.message


@board_router.get(
    "/{uuid}/columns",
    response_model=List[ColumnOut],
    responses={
        200: {
            "description": "Список колонок доски",
        },
        404: {
            "description": "Доска не найдена",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def get_board_columns_data(uuid: UUID):
    result = await BoardService.get_board_column_data(uuid)
    if result.is_error:
        raise HTTPException(status_code=result.status_code, detail=result.message)

    return result.message


@board_router.post(
    "/{board_uuid}/columns",
    responses={
        201: {
            "description": "Колонка создана",
            "content": {
                "application/json": {"schema": SuccessResponse.model_json_schema()}
            },
        },
        400: {
            "description": "Ошибка создания колонки",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
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


@board_router.patch(
    "/{uuid}/info",
    responses={
        200: {
            "description": "Данные доски обновлены",
            "content": {
                "application/json": {"schema": SuccessResponse.model_json_schema()}
            },
        },
        400: {
            "description": "Ошибка обновления доски",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def update_board_info(uuid: UUID, data: UpdateBoard):
    res = await BoardService.update_board_fields(uuid, data)

    if res.is_error:
        raise HTTPException(status_code=res.status_code, detail=res.message)

    return JSONResponse(
        content={"message": res.message},
    )


@board_router.delete(
    "/{uuid}",
    responses={
        200: {
            "description": "Доска удалена",
            "content": {
                "application/json": {"schema": SuccessResponse.model_json_schema()}
            },
        },
        404: {
            "description": "Доска не найдена",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def delete_board(uuid: UUID):
    res = await BoardService.delete_board(uuid)
    if res.is_error:
        raise HTTPException(status_code=res.status_code, detail=res.message)

    return JSONResponse(content={"message": res.message}, status_code=res.status_code)


@board_router.post(
    "/{uuid}/comments",
    responses={
        201: {
            "description": "Комментарий создан",
            "content": {
                "application/json": {"schema": SuccessResponse.model_json_schema()}
            },
        },
        400: {
            "description": "Ошибка создания комментария",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
        401: {
            "description": "Unauthorized",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
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


@board_router.get(
    "/{uuid}/comments",
    response_model=List[CommentData],
    responses={
        200: {
            "description": "Список комментариев",
        },
    },
)
async def get_comments(uuid: UUID):
    result = await BoardService.get_comments(uuid=uuid)

    return result.message


@board_router.get(
    "/{uuid}/status_tasks",
    responses={
        200: {
            "description": "Список задач по статусу",
            "content": {
                "application/json": {"schema": SuccessResponse.model_json_schema()}
            },
        },
    },
)
async def get_all_tasks_with_status(uuid: UUID):
    res = await BoardService.get_tasks_with_status(uuid)
    return res.message
