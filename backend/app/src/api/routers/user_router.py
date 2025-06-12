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

user_router = APIRouter(prefix="/users", tags=["User Endpoints"])


@user_router.get("/", response_model=List[FullInfo])
async def get_all_users():
    """
    # Возвращает полную информацию о всех пользователях
    """
    return await UserService.get_all_users()


@user_router.get("/search", response_model=List[UserPreview])
async def search_user(query: str = Query(min_length=1)):
    return await UserService.search_users(query=query)


@user_router.get("/me", response_model=FullInfo)
async def get_self_user(request: Request):
    cookie_data = request.cookies.get("user", None)
    if not cookie_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="unauthorized!"
        )

    user = await UserService.get_user(cookie_data)
    if not user:
        raise HTTPException(
            detail="user not found!", status_code=status.HTTP_404_NOT_FOUND
        )
    return user


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
    user = await UserService.get_user_info(uuid)
    if not user:
        raise HTTPException(
            detail="user not found!", status_code=status.HTTP_404_NOT_FOUND
        )

    return user


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
    token = await UserService.create_user(user_data)
    if not token:
        raise HTTPException(
            detail="cannot create user!", status_code=status.HTTP_400_BAD_REQUEST
        )

    response = JSONResponse(
        content={"message": "user created successfully"},
        status_code=status.HTTP_201_CREATED,
    )

    response.set_cookie(key="user", value=token, httponly=True)

    return response


@user_router.put(
    "/{uuid}",
    responses={
        400: {
            "description": "Cannot update user",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        }
    },
)
async def update_user_by_uuid(uuid: UUID, user_data: BaseUserInfo):
    """
    # Обновляет данные пользователя по uuid
    """
    is_updated = await UserService.update_user(uuid=uuid, user=user_data)

    if not is_updated:
        raise HTTPException(
            detail="cannot update user!", status_code=status.HTTP_400_BAD_REQUEST
        )

    return JSONResponse(
        content={"message": "user updated successfully"}, status_code=status.HTTP_200_OK
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
    is_deleted = await UserService.delete_user(uuid=uuid)

    if not is_deleted:
        raise HTTPException(
            detail="user not found!", status_code=status.HTTP_404_NOT_FOUND
        )

    return JSONResponse(
        content={"message": "user deleted successfully"}, status_code=status.HTTP_200_OK
    )


@user_router.patch(
    "/change_password",
    responses={
        400: {
            "description": "Cannot update password",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        },
        401: {
            "description": "Unauthorized",
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
        raise HTTPException(status_code=401, detail="unauthorized")
    is_updated = await UserService.update_pass(
        token=token, old_password=data.old_password, new_password=data.new_password
    )

    if not is_updated:
        raise HTTPException(
            detail="cannot update password!", status_code=status.HTTP_400_BAD_REQUEST
        )

    return JSONResponse(
        content={"message": "password updated successfully"},
        status_code=status.HTTP_200_OK,
    )


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
    token = await UserService.login_user(
        username=data.username,
        password=data.password,
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="invalid data"
        )

    response = JSONResponse(
        content={"message": "login successfully"}, status_code=status.HTTP_200_OK
    )
    response.set_cookie(key="user", value=str(token), httponly=True)

    return response


# TODO: зачистка куков нормальная
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


@user_router.get(
    "/role/{board_uuid}",
    responses={
        401: {
            "description": "Unauthorized",
            "content": {"application/json": {"schema": Error.model_json_schema()}},
        }
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

    role = await UserService.get_user_role(cookie_data, board_uuid)

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="user or board not found!"
        )

    return JSONResponse(content={"message": role}, status_code=status.HTTP_200_OK)
