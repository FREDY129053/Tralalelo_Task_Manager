from typing import List, Union
from uuid import UUID

import backend.app.src.repository.user as UserRepo
from backend.app.src.helpers.avatar_gen.avatar_gen import AvatarGenerator
from backend.app.src.helpers.jwt import create_jwt_token, decode_jwt_token
from backend.app.src.helpers.password import check_pass, hash_pass
from backend.app.src.schemas import BaseUserInfo, CreateUser, FullInfo


async def get_all_users() -> List[FullInfo]:
  return await UserRepo.get_all_users()


async def get_user_info(uuid: UUID) -> Union[FullInfo, None]:
  user = await UserRepo.get_user_info(uuid=uuid)
  if not user:
    return None
  
  return user


async def create_user(user: CreateUser) -> bool:
  new_pass = hash_pass(user.hashed_password)
  avatar = AvatarGenerator(user.username).generate_avatar_url()

  data = await UserRepo.create_user(
    uuid=user.id,
    username=user.username,
    email=user.email,
    phone=user.phone,
    avatar_url=avatar,
    is_admin=user.is_admin,
    password=new_pass
  )

  return True if data else False


async def update_user(uuid: UUID, user: BaseUserInfo) -> bool:
  new_pass = hash_pass(user.hashed_password)
  avatar = AvatarGenerator(user.username).generate_avatar_url()

  data = await UserRepo.update_user(
    uuid=uuid,
    username=user.username,
    email=user.email,
    phone=user.phone,
    avatar_url=avatar,
    is_admin=user.is_admin,
    password=new_pass
  )

  return True if data else False


async def delete_user(uuid: UUID) -> bool:
  return await UserRepo.delete_user(uuid=uuid)


async def login_user(username: str, password: str) -> Union[bool, str]:
  user = await UserRepo.get_user_by_username(username=username)
  if not user:
    return False
  
  is_right_pass = check_pass(user.hashed_password, password)
  if not is_right_pass:
    return False
  
  token = create_jwt_token({
    "uuid": str(user.id),
    "is_admin": "yes" if user.is_admin else "no"
  })

  return token

async def get_user_role(token: str, board_uuid: UUID) -> Union[str, None]:
  token_data = decode_jwt_token(token)
  if not token_data:
    return None
  
  user_uuid = token_data.get("uuid", None)
  
  if not user_uuid:
    return None
  
  return await UserRepo.get_role(user_uuid=user_uuid, board_uuid=board_uuid)