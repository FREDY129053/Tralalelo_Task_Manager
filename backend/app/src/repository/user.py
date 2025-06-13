from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from rapidfuzz import fuzz
from tortoise.exceptions import IntegrityError

from backend.app.src.db.models import BoardUser, User
from backend.app.src.enums.role import UserRole


async def get_all_users() -> List[User]:
    """Получение всех пользователей в системе

    Returns:
        List[User]: список всех пользователей
    """
    return await User.all()


async def get_user_info(uuid: UUID) -> Optional[User]:
    """Получение данных о пользователе по UUID

    Args:
        uuid (UUID): уникальный идентификатор пользователя

    Returns:
        Optional[User]: Если пользователь найден, то информаиця о нем, иначе `None`
    """
    return await User.get_or_none(id=uuid)


async def get_user_by_username(username: str) -> Optional[User]:
    """Получение информации о пользователе через username

    Args:
        username (str): ник пользователя в системе

    Returns:
        Optional[User]: информация о пользователе, если он есть в базе, иначе `None`
    """
    return await User.get_or_none(username=username)


async def create_user(
    username: str,
    email: str,
    avatar_url: Optional[str],
    password: str,
) -> Optional[User]:
    """Создание записи пользователя в системе

    Args:
        username (str): ник пользователя
        email (str): почта пользователя
        avatar_url (Optional[str]): ссылка на аватарку пользователя
        password (str): хеш пароля пользователя

    Returns:
        Optional[User]: информация о пользователе, если он создан, иначе `None`
    """
    try:
        return await User.create(
            username=username,
            email=email,
            avatar_url=avatar_url,
            hashed_password=password,
        )
    except IntegrityError:
        return None


async def update_pass(uuid: UUID, new_password: str) -> bool:
    """Обновление пароля пользователя

    Args:
        uuid (UUID): уникальный идентификатор пользователя
        new_password (str): хеш нового пароля

    Returns:
        bool:
            - `True`, если удалось обновить пароль
            - `False`, если есть проблемы с наличием пользователя в базе
    """
    try:
        user = await User.get(id=uuid)
        user.hashed_password = new_password
        await user.save()
        return True
    except Exception:
        return False


async def update_user(
    uuid: UUID,
    username: str,
    email: str,
    avatar_url: Optional[str],
    is_admin: bool,
    password: str,
) -> bool:
    """Обновление данных пользователя

    Args:
        uuid (UUID): уникальный идентификатор
        username (str): ник пользователя
        email (str): почта пользователя
        avatar_url (Optional[str]): ссылка на аватарку пользователя
        is_admin (bool): флаг, является ли пользователь админом
        password (str): хеш пароля пользователя

    Returns:
        bool:
            - `True`, если пользователь есть в базе и удалось обновить
            - `False`, если пользователя нет в базе
    """
    user_on_server = await User.get_or_none(id=uuid)

    if not user_on_server:
        return False

    user_on_server.username = username
    user_on_server.email = email
    user_on_server.avatar_url = avatar_url
    user_on_server.is_admin = is_admin
    user_on_server.hashed_password = password

    try:
        await user_on_server.save()
        return True
    except Exception:
        return False


async def delete_user(uuid: UUID) -> bool:
    """Удаление пользователя по UUID

    Args:
        uuid (UUID): уникальный идентификатор пользователя

    Returns:
        bool:
            - `True`, если пользователь есть в базе и удалось удалить
            - `False`, если пользователя нет в базе
    """
    user = await User.get_or_none(id=uuid)
    if not user:
        return False

    try:
        await user.delete()
        return True
    except Exception:
        return False


async def get_role(user_uuid: UUID, board_uuid: UUID) -> Optional[UserRole]:
    """Получение роли пользователя для конкретной доски

    Args:
        user_uuid (UUID): идентификатор пользователя
        board_uuid (UUID): идентификатор доски

    Returns:
        Optional[UserRole]: Роль пользователя, если есть данные о нем в доске, иначе `None`. Возможные значения:
            - `UserRole.creator`: пользователь создатель доски
            - `UserRole.moderator`: пользователь модератор доски
            - `UserRole.member`: пользователь просто участник доски
    """
    board_info = await BoardUser.filter(user_id=user_uuid, board_id=board_uuid).first()

    if board_info:
        return board_info.role
    else:
        return None


async def search_users(query: str) -> List[Dict[str, Any]]:
    """Поиск пользователей по строковому запросу

    Args:
        query (str): запрос

    Returns:
        List[Dict[str, Any]]: список пользователей, username которых совпал в запросом на 65+%
    """
    users = await User.all().values("id", "username", "avatar_url")
    results: List[Tuple[float, Dict[str, Any]]] = []
    for user in users:
        similarity = fuzz.partial_ratio(
            query.lower().strip(), user["username"].lower().strip()
        )
        if similarity >= 65:
            results.append((similarity, user))

    results.sort(reverse=True, key=lambda x: x[0])

    return [user for _, user in results[:20]]
