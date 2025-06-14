from typing import Any, Dict, List, Union
from uuid import UUID

import backend.app.src.repository.user as UserRepo
from backend.app.src.helpers.avatar_gen.avatar_gen import AvatarGenerator
from backend.app.src.helpers.jwt import create_jwt_token, decode_jwt_token
from backend.app.src.helpers.password import check_pass, hash_pass
from backend.app.src.schemas import BaseUserInfo, FullInfo
from backend.app.src.schemas.service_response import ServiceMessage
from backend.app.src.schemas.user import RegUser


async def get_all_users() -> ServiceMessage[List[FullInfo]]:
    users = await UserRepo.get_all_users()
    return ServiceMessage(message=users)


async def get_user_info(uuid: UUID) -> ServiceMessage[Union[str, FullInfo]]:
    user = await UserRepo.get_user_info(uuid=uuid)
    if not user:
        return ServiceMessage(is_error=True, message="user not found", status_code=404)

    return ServiceMessage(message=user)


async def get_user(token: str) -> ServiceMessage[Union[str, FullInfo]]:
    uuid = decode_jwt_token(token=token)
    if not uuid:
        return ServiceMessage(is_error=True, message="unauthorized", status_code=401)
    user = await UserRepo.get_user_info(UUID(uuid["uuid"]))
    if not user:
        return ServiceMessage(is_error=True, message="user not found", status_code=404)

    return ServiceMessage(message=user)


async def create_user(user: RegUser) -> ServiceMessage[str]:
    new_pass = hash_pass(user.password)
    avatar = AvatarGenerator(user.username).generate_avatar_url()

    data = await UserRepo.create_user(
        username=user.username,
        email=user.email,
        avatar_url=avatar,
        password=new_pass,
    )
    if not data:
        return ServiceMessage(
            is_error=True, message="cannot create user", status_code=400
        )

    token = create_jwt_token(
        {"uuid": str(data.id), "is_admin": "yes" if data.is_admin else "no"}
    )

    return ServiceMessage(message=token, status_code=201)


async def update_user(uuid: UUID, user: BaseUserInfo) -> ServiceMessage[str]:
    avatar = AvatarGenerator(user.username).generate_avatar_url()

    is_updated = await UserRepo.update_user(
        uuid=uuid,
        username=user.username,
        email=user.email,
        avatar_url=avatar,
        is_admin=user.is_admin,
        password=user.hashed_password,
    )

    if not is_updated:
        return ServiceMessage(is_error=True, message="user not found", status_code=404)

    return ServiceMessage(message="user updated")


async def update_pass(
    token: str, old_password: str, new_password: str
) -> ServiceMessage[str]:
    user_data = decode_jwt_token(token=token)
    if not user_data:
        return ServiceMessage(is_error=True, message="unauthorized", status_code=401)
    user_id = UUID(user_data.get("uuid", ""))
    user = await UserRepo.get_user_info(uuid=user_id)
    if not user:
        return ServiceMessage(is_error=True, message="user not found", status_code=404)

    is_right_pass = check_pass(user.hashed_password, old_password)
    if not is_right_pass:
        return ServiceMessage(
            is_error=True, message="passwords not match", status_code=400
        )

    new_password = hash_pass(new_password)
    await UserRepo.update_pass(uuid=user_id, new_password=new_password)

    return ServiceMessage(message="password changed")


async def delete_user(uuid: UUID) -> ServiceMessage[str]:
    is_deleted = await UserRepo.delete_user(uuid=uuid)
    if not is_deleted:
        return ServiceMessage(is_error=True, message="user not found", status_code=404)
    return ServiceMessage(message="user deleted")


async def login_user(username: str, password: str) -> ServiceMessage[str]:
    user = await UserRepo.get_user_by_username(username=username)
    if not user:
        return ServiceMessage(
            is_error=True, message="invalid username or password", status_code=400
        )

    is_right_pass = check_pass(user.hashed_password, password)
    if not is_right_pass:
        return ServiceMessage(
            is_error=True, message="invalid username or password", status_code=400
        )

    token = create_jwt_token(
        {"uuid": str(user.id), "is_admin": "yes" if user.is_admin else "no"}
    )

    return ServiceMessage(message=token)


async def get_user_role(token: str, board_uuid: UUID) -> ServiceMessage[str]:
    token_data = decode_jwt_token(token)
    if not token_data:
        return ServiceMessage(is_error=True, message="unauthorized", status_code=401)

    user_uuid = token_data.get("uuid", None)

    if not user_uuid:
        return ServiceMessage(is_error=True, message="unauthorized", status_code=401)

    role = await UserRepo.get_role(user_uuid=user_uuid, board_uuid=board_uuid)

    return ServiceMessage(message=role)


async def search_users(query: str) -> ServiceMessage[List[Dict[str, Any]]]:
    res = await UserRepo.search_users(query=query)

    return ServiceMessage(message=res)
