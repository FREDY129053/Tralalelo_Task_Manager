from uuid import UUID
from typing import Dict, List, Union

from backend.app.src.schemas import RegUser, BaseUserInfo, FullInfo, Login
import backend.app.src.services.user as UserService 

from fastapi import APIRouter, HTTPException, status, Request, Response, Cookie
from fastapi.responses import JSONResponse

user_router = APIRouter(prefix='/users', tags=["User Endpoints"])

@user_router.get('/', response_model=List[FullInfo])
async def get_all_users():
  """
  # Возвращает полную информацию о всех пользователях
  ### - **username**: логин
  ### - **email**: электронная почта
  ### - **phone**: телефон
  ### - **avatar_url**: ссылка на аватарку
  ### - **is_admin**: является ли пользователь админом
  ### - **hashed_password**: хешированный пароль
  ### - **id**: id пользователя
  ### - **registred_at**: время регистрации
  """
  return await UserService.get_all_users()


@user_router.get('/{uuid}', response_model=FullInfo)
async def get_user_by_uuid(uuid: UUID):
  """
  # Возвращает полную информацию о пользователе по uuid
  ### - *uuid: id пользователя*
  ### - **username**: логин
  ### - **email**: электронная почта
  ### - **phone**: телефон
  ### - **avatar_url**: ссылка на аватарку
  ### - **is_admin**: является ли пользователь админом
  ### - **hashed_password**: хешированный пароль
  ### - **id**: id пользователя
  ### - **registred_at**: время регистрации
  ## Ошибки
  ### - 404: Пользователь не найден
  """
  user = await UserService.get_user_info(uuid)
  if not user:
    raise HTTPException(
      detail="user not found!",
      status_code=status.HTTP_404_NOT_FOUND
    )

  return user


@user_router.post('/')
async def create_user(user_data: RegUser):
  """
  # Регистрация нового пользователя
  ### - *username: логин*
  ### - *email: электронная почта*
  ### - *phone: телефон*
  ### - *password: пароль*
  ## Ошибки
  ### - 400: Нельзя создать пользователя
  ### - 422: Неправильынй формат почты или телефона
  """
  is_created = await UserService.create_user(user_data)
  if not is_created:
    raise HTTPException(
      detail="cannot create user!",
      status_code=status.HTTP_400_BAD_REQUEST
    )

  return JSONResponse(
    content={"message": "user created successfully"},
    status_code=status.HTTP_201_CREATED
  )


@user_router.put('/{uuid}')
async def update_user_by_uuid(uuid: UUID, user_data: BaseUserInfo):
  """
  # Обновляет данные пользователя по uuid
  ### - *uuid: id пользователя*
  ### - **username**: логин
  ### - **email**: электронная почта
  ### - **phone**: телефон
  ### - **avatar_url**: ссылка на аватарку
  ### - **is_admin**: является ли пользователь админом
  ### - **hashed_password**: хешированный пароль
  ## Ошибки
  ### - 400: Нельзя обновить данные
  """
  is_updated = await UserService.update_user(uuid=uuid, user=user_data)

  if not is_updated:
    raise HTTPException(
      detail="cannot update user!",
      status_code=status.HTTP_400_BAD_REQUEST
    )

  return JSONResponse(
    content={"message": "user updated successfully"},
    status_code=status.HTTP_200_OK
  )


@user_router.delete('/{uuid}')
async def delete_user_by_uuid(uuid: UUID):
  """
  # Удаляет пользователя по uuid
  ### - *uuid: id пользователя*
  ## Ошибки
  ### - 404: Пользователь не найден
  """
  is_deleted = await UserService.delete_user(uuid=uuid)

  if not is_deleted:
    raise HTTPException(
      detail="user not found!",
      status_code=status.HTTP_404_NOT_FOUND
    )

  return JSONResponse(
    content={"message": "user deleted successfully"},
    status_code=status.HTTP_200_OK
  )


@user_router.patch('/{uuid}')
async def update_user_password(uuid: UUID, new_pass: str):
  """
  # Обновляет пароль пользователя по uuid
  ### - *uuid: id пользователя*
  ### - *new_pass: новый пароль*
  ## Ошибки
  ### - 400: Нельзя обновить пароль
  """
  user = await UserService.get_user_info(uuid)
  is_updated = await UserService.update_user(uuid=uuid, user=user, new_password=new_pass)

  if not is_updated:
    raise HTTPException(
      detail="cannot update password!",
      status_code=status.HTTP_400_BAD_REQUEST
    )

  return JSONResponse(
    content={"message": "password updated successfully"},
    status_code=status.HTTP_200_OK
  )

@user_router.post('/login')
async def login_user(data: Login):
  """
  # Вход в аккаунт
  ## Ошибки
  ### - 400: Неверные данные
  """
  token = await UserService.login_user(
    username=data.username,
    password=data.password,
  )

  if not token:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="invalid data"
    )

  response = JSONResponse(content={"message": "login successfully"}, status_code=status.HTTP_200_OK)
  response.set_cookie(key="user", value=token, httponly=True)

  return response

# TODO: зачистка куков нормальная
@user_router.post('/logout')
async def logout_user(request: Request, response: Response):
  """
  # Выход из аккаунта
  ## Ошибки
  ### - 401: Пользователь не авторизован
  """
  cookie_data = request.cookies.get("user", None)

  if not cookie_data:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="unauthorized!"
    )

  response.delete_cookie("user")

  return JSONResponse(
    content={"message": "logout successfully!"},
    status_code=status.HTTP_200_OK
  )


@user_router.get('/role/{board_uuid}')
async def get_role_at_board(request: Request, board_uuid: UUID):
  """
  # Получение роли в доске
  ### - *board_uuid: id доски*
  ## Ошибки
  ### - 401: Пользователь не авторизован
  ### - 404: Доска или пользователь не найдены
  """
  cookie_data = request.cookies.get("user", None)

  role = await UserService.get_user_role(cookie_data, board_uuid)
  if not cookie_data:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="unauthorized!"
    )

  if not role:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="user or board not found!"
    )

  return JSONResponse(
    content={"message": role},
    status_code=status.HTTP_200_OK
  )
  