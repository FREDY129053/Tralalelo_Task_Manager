from typing import List, Union
from uuid import UUID

from backend.app.src.db.models import User, BoardUser, Board


async def get_all_users() -> List[User]:
    return await User.all()


async def get_user_info(uuid: UUID) -> Union[User, None]:
    return await User.get_or_none(id=uuid)

async def get_user_by_username(username: str) -> Union[User, None]:
    return await User.get_or_none(username=username)

async def create_user(
    uuid: UUID,
    username: str,
    email: str,
    phone: str,
    avatar_url: str,
    is_admin: bool,
    password: str,
) -> User:
    return await User.create(
        id=uuid,
        username=username,
        email=email,
        phone=phone,
        avatar_url=avatar_url,
        is_admin=is_admin,
        hashed_password=password,
    )


async def update_user(
    uuid: UUID,
    username: str,
    email: str,
    phone: str,
    avatar_url: str,
    is_admin: bool,
    password: str,
) -> bool:
    user_on_server = await User.get_or_none(id=uuid)

    if not user_on_server:
        return False

    user_on_server.username = username
    user_on_server.email = email
    user_on_server.phone = phone
    user_on_server.avatar_url = avatar_url
    user_on_server.is_admin = is_admin
    user_on_server.hashed_password = password

    return await user_on_server.save() is None


async def delete_user(uuid: UUID) -> bool:
    user = await User.get_or_none(id=uuid)
    if not user:
        return False

    return await user.delete() is None

async def get_role(user_uuid: UUID, board_uuid: UUID) -> Union[str, None]:
    board_info = await BoardUser.filter(
        user_id=user_uuid,
        board_id=board_uuid
    ).first()

    if board_info:
        return board_info.role
    else:
        return None