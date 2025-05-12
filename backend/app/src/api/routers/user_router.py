from uuid import UUID
from typing import Dict, List, Union

from backend.app.src.schemas import CreateUser, BaseUserInfo, FullInfo, Login
import backend.app.src.services.user as UserService 

from fastapi import APIRouter, HTTPException, status, Request, Response, Cookie
from fastapi.responses import JSONResponse

user_router = APIRouter(prefix='/users', tags=["User Endpoints"])

@user_router.get('/', response_model=List[FullInfo])
async def get_all_users():
  return await UserService.get_all_users()


@user_router.get('/{uuid}', response_model=FullInfo)
async def get_user_by_uuid(uuid: UUID):
  user = await UserService.get_user_info(uuid)
  if not user:
    raise HTTPException(
      detail={"error": "user not found!"},
      status_code=status.HTTP_404_NOT_FOUND
    )
  
  return user


@user_router.post('/')
async def create_user(user_data: CreateUser):
  is_created = await UserService.create_user(user_data)
  if not is_created:
    raise HTTPException(
      detail={"error": "cannot create user!"},
      status_code=status.HTTP_400_BAD_REQUEST
    )
  
  return JSONResponse(
    content={"message": "user created successfully"},
    status_code=status.HTTP_201_CREATED
  )


@user_router.put('/{uuid}')
async def update_user_by_uuid(uuid: UUID, user_data: BaseUserInfo):
  is_updated = await UserService.update_user(uuid=uuid, user=user_data)

  if not is_updated:
    raise HTTPException(
      detail={"error": "cannot update user!"},
      status_code=status.HTTP_400_BAD_REQUEST
    )
  
  return JSONResponse(
    content={"message": "user updated successfully"},
    status_code=status.HTTP_200_OK
  )


@user_router.delete('/{uuid}')
async def delete_user_by_uuid(uuid: UUID):
  is_deleted = await UserService.delete_user(uuid=uuid)

  if not is_deleted:
    raise HTTPException(
      detail={"error": "user not found!"},
      status_code=status.HTTP_404_NOT_FOUND
    )
  
  return JSONResponse(
    content={"message": "user deleted successfully"},
    status_code=status.HTTP_200_OK
  )


@user_router.patch('/{uuid}')
async def update_user_password(uuid: UUID, new_pass: str):
  ...

@user_router.post('/login')
async def login_user(data: Login):
  token = await UserService.login_user(
    username=data.username,
    password=data.password,
  )

  if not token:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail={"error": "invalid data"}
    )
  
  response = JSONResponse(content={"message": "login successfully"}, status_code=status.HTTP_200_OK)
  response.set_cookie(key="user", value=token, httponly=True)

  return response

# TODO: зачистка куков нормальная
@user_router.post('/logout')
async def logout_user(request: Request, response: Response):
  cookie_data = request.cookies.get("user", None)
  
  if not cookie_data:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail={"error": "unauthorized!"}
    )
  
  response.delete_cookie("user")

  return JSONResponse(
    content={"message": "logout successfully!"},
    status_code=status.HTTP_200_OK
  )


@user_router.get('/role/{board_uuid}')
async def get_role_at_board(request: Request, board_uuid: UUID):
  cookie_data = request.cookies.get("user", None)

  role = await UserService.get_user_role(cookie_data, board_uuid)
  if not cookie_data or not role:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail={"error": "unauthorized!"}
    )
  
  return JSONResponse(
    content={"message": role},
    status_code=status.HTTP_200_OK
  )
  