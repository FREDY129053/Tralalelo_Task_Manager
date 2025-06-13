from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Request, Response, status
from fastapi.responses import JSONResponse

import backend.app.src.services.user as UserService
from backend.app.src.schemas import (
    BaseUserInfo,
    Error,
    FullInfo,
    Login,
    RegUser,
    UpdatePass,
    UserPreview,
)
from backend.app.src.schemas.service_response import SuccessResponse

user_router = APIRouter(prefix="/users", tags=["User Endpoints"])


@user_router.get("/", response_model=List[FullInfo])
async def get_all_users():
    """
    # Возвращает полную информацию о всех пользователях
    """
    result = await UserService.get_all_users()

    return result.message


@user_router.post(
    "/",
    responses={
        400: {
            "description": "Invalid user input",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        }
    },
)
async def create_user(user_data: RegUser):
    """
    # Регистрация нового пользователя
    """
    result = await UserService.create_user(user_data)
    if result.is_error:
        raise HTTPException(detail=result.message, status_code=result.status_code)

    response = JSONResponse(
        content={"message": result.message},
        status_code=status.HTTP_201_CREATED,
    )

    response.set_cookie(key="user", value=str(result.message), httponly=True)

    return response


@user_router.get("/search", response_model=List[UserPreview])
async def search_user(query: str = Query(min_length=1)):
    """
    # Поиск пользователя по username
    """
    result = await UserService.search_users(query=query)
    return result.message


@user_router.get(
    "/me",
    response_model=FullInfo,
    responses={
        401: {
            "description": "Unauthorized",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
        404: {
            "description": "User not found",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def get_self_user(request: Request):
    """
    # Возвращение информации о самом себе
    """
    cookie_data = request.cookies.get("user", None)
    if not cookie_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="unauthorized!"
        )

    result = await UserService.get_user(cookie_data)
    if result.is_error:
        raise HTTPException(detail=result.message, status_code=result.status_code)
    return result.message


@user_router.post(
    "/login",
    responses={
        400: {
            "description": "Invalid login data",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        }
    },
)
async def login_user(data: Login):
    """
    # Вход в аккаунт
    """
    result = await UserService.login_user(
        username=data.username,
        password=data.password,
    )

    if result.is_error:
        raise HTTPException(status_code=result.status_code, detail=result.message)

    response = JSONResponse(
        content={"message": result.message}, status_code=result.status_code
    )
    response.set_cookie(key="user", value=str(result.message), httponly=True)

    return response


@user_router.post(
    "/logout",
    responses={
        401: {
            "description": "Unauthorized",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        }
    },
)
async def logout_user(request: Request, response: Response):
    """
    # Выход из аккаунта
    """
    cookie_data = request.cookies.get("user", None)

    if not cookie_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="unauthorized!"
        )

    response.delete_cookie(key="user", path="/")
    return True


@user_router.patch(
    "/change_password",
    responses={
        400: {
            "description": "Password dont match",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
        401: {
            "description": "Unauthorized",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
        404: {
            "description": "User not found",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def update_user_password(request: Request, data: UpdatePass):
    """
    # Обновляет пароль пользователя по uuid
    """
    token = request.cookies.get("user")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="unauthorized"
        )

    result = await UserService.update_pass(
        token=token, old_password=data.old_password, new_password=data.new_password
    )

    if result.is_error:
        raise HTTPException(detail=result.message, status_code=result.status_code)

    return JSONResponse(
        content={"message": result.message},
        status_code=result.status_code,
    )


@user_router.get(
    "/{uuid}",
    response_model=FullInfo,
    responses={
        404: {
            "description": "User not found",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        }
    },
)
async def get_user_by_uuid(uuid: UUID):
    """
    # Возвращает полную информацию о пользователе по uuid
    """
    result = await UserService.get_user_info(uuid)
    if result.is_error:
        raise HTTPException(detail=result.message, status_code=result.status_code)

    return result.message


@user_router.put(
    "/{uuid}",
    responses={
        404: {
            "description": "User not found",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        }
    },
)
async def update_user_by_uuid(uuid: UUID, user_data: BaseUserInfo):
    """
    # Обновляет данные пользователя по uuid
    """
    result = await UserService.update_user(uuid=uuid, user=user_data)

    if result.is_error:
        raise HTTPException(detail=result.message, status_code=result.status_code)

    return JSONResponse(
        content={"message": result.message}, status_code=result.status_code
    )


@user_router.delete(
    "/{uuid}",
    responses={
        404: {
            "description": "User not found",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        }
    },
)
async def delete_user_by_uuid(uuid: UUID):
    """
    # Удаляет пользователя по uuid
    """
    result = await UserService.delete_user(uuid=uuid)

    if result.is_error:
        raise HTTPException(detail=result.message, status_code=result.status_code)

    return JSONResponse(
        content={"message": result.message}, status_code=result.status_code
    )


@user_router.get(
    "/role/{board_uuid}",
    responses={
        200: {
            "description": "Successful Response",
            "content": {
                "application/json": {"schema": SuccessResponse.model_json_schema()}
            },
        },
        401: {
            "description": "Unauthorized",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
    },
)
async def get_role_at_board(request: Request, board_uuid: UUID):
    """
    # Получение роли в доске
    """
    cookie_data = request.cookies.get("user", None)
    if not cookie_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="unauthorized!"
        )

    result = await UserService.get_user_role(cookie_data, board_uuid)

    if result.is_error:
        raise HTTPException(status_code=result.status_code, detail=result.message)

    return JSONResponse(
        content={"message": result.message}, status_code=result.status_code
    )
