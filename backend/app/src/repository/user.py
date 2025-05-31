from typing import List, Optional
from uuid import UUID

from rapidfuzz import fuzz
from tortoise.exceptions import IntegrityError

from backend.app.src.db.models import BoardUser, User


async def get_all_users() -> List[User]:
    return await User.all()


async def get_user_info(uuid: UUID) -> Optional[User]:
    return await User.get_or_none(id=uuid)


async def get_user_by_username(username: str) -> Optional[User]:
    return await User.get_or_none(username=username)


async def create_user(
    username: str,
    email: str,
    phone: Optional[str],
    avatar_url: str,
    password: str,
) -> Optional[User]:
    try:
        return await User.create(
            username=username,
            email=email,
            phone=phone,
            avatar_url=avatar_url,
            hashed_password=password,
        )
    except IntegrityError:
        return None


async def update_pass(uuid: UUID, new_password: str):
    user = await User.get(id=uuid)
    user.hashed_password = new_password
    await user.save()


async def update_user(
    uuid: UUID,
    username: str,
    email: str,
    phone: Optional[str],
    avatar_url: Optional[str],
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


async def get_role(user_uuid: UUID, board_uuid: UUID) -> Optional[str]:
    board_info = await BoardUser.filter(user_id=user_uuid, board_id=board_uuid).first()

    if board_info:
        return board_info.role
    else:
        return None


async def search_users(query: str):
    users = await User.all().values("id", "username", "avatar_url")
    results = []
    for user in users:
        similarity = fuzz.partial_ratio(
            query.lower().strip(), user["username"].lower().strip()
        )
        if similarity >= 65:
            results.append((similarity, user))

    results.sort(reverse=True, key=lambda x: x[0])
    return [user for _, user in results[:20]]
