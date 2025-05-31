from typing import List, Optional, Union
from uuid import UUID

import backend.app.src.repository.user as UserRepo
from backend.app.src.helpers.avatar_gen.avatar_gen import AvatarGenerator
from backend.app.src.helpers.jwt import create_jwt_token, decode_jwt_token
from backend.app.src.helpers.password import check_pass, hash_pass
from backend.app.src.schemas import BaseUserInfo, FullInfo
from backend.app.src.schemas.user import RegUser


async def get_all_users() -> List[FullInfo]:
    return await UserRepo.get_all_users()


async def get_user_info(uuid: UUID) -> Optional[FullInfo]:
    user = await UserRepo.get_user_info(uuid=uuid)
    if not user:
        return None

    return user


async def create_user(user: RegUser) -> Optional[str]:
    new_pass = hash_pass(user.password)
    avatar = AvatarGenerator(user.username).generate_avatar_url()
    phone = user.phone[4:] if user.phone else None

    data = await UserRepo.create_user(
        username=user.username,
        email=user.email,
        phone=phone,
        avatar_url=avatar,
        password=new_pass,
    )
    if not data:
        return None

    token = create_jwt_token(
        {"uuid": str(data.id), "is_admin": "yes" if data.is_admin else "no"}
    )

    return token


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
        password=new_pass,
    )

    return True if data else False


async def update_pass(token: str, old_password: str, new_password: str) -> bool:
    user_data = decode_jwt_token(token=token)
    if not user_data:
        return False
    user_id = UUID(user_data.get("uuid", ""))
    user = await UserRepo.get_user_info(uuid=user_id)
    if not user:
        return False

    is_right_pass = check_pass(user.hashed_password, old_password)
    if not is_right_pass:
        return False

    new_password = hash_pass(new_password)
    await UserRepo.update_pass(uuid=user_id, new_password=new_password)

    return True


async def delete_user(uuid: UUID) -> bool:
    return await UserRepo.delete_user(uuid=uuid)


async def login_user(username: str, password: str) -> Union[bool, str]:
    user = await UserRepo.get_user_by_username(username=username)
    if not user:
        return False

    is_right_pass = check_pass(user.hashed_password, password)
    if not is_right_pass:
        return False

    token = create_jwt_token(
        {"uuid": str(user.id), "is_admin": "yes" if user.is_admin else "no"}
    )

    return token


async def get_user_role(token: str, board_uuid: UUID) -> Union[str, None]:
    token_data = decode_jwt_token(token)
    if not token_data:
        return None

    user_uuid = token_data.get("uuid", None)

    if not user_uuid:
        return None

    return await UserRepo.get_role(user_uuid=user_uuid, board_uuid=board_uuid)


async def search_users(query: str):
    res = await UserRepo.search_users(query=query)

    return res
