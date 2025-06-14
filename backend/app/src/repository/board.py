from typing import Any, Dict, List, Optional
from uuid import UUID

from tortoise.exceptions import IntegrityError

from backend.app.src.db.models import (
    Board,
    BoardComment,
    BoardUser,
    Column,
    TaskResponsible,
    User,
)
from backend.app.src.db.models.boards import Task
from backend.app.src.enums import UserRole
from backend.app.src.enums.status import Status
from backend.app.src.schemas import (
    AbsoluteFullBoardInfo,
    AllowBoard,
    BoardUserPreview,
    ColumnOut,
    TaskShortOut,
)
from backend.app.src.schemas.board import CommentData
from backend.app.src.schemas.user import UserPreview


async def get_all_boards() -> List[Board]:
    """Получение всех досок

    Returns:
        List[Board]: массив досок
    """
    return await Board.all()


async def get_all_users_boards(user_id: UUID) -> List[AllowBoard]:
    """Получение всех досок, где пользователь участник

    Args:
        user_id (UUID): идентификатор пользователя

    Returns:
        List[AllowBoard]: массив досок
    """
    boards = (
        await Board.filter(
            members__user_id=user_id,
            members__role__in=[UserRole.member, UserRole.moderator],
        )
        .prefetch_related("members")
        .all()
    )

    result = []
    for board in boards:
        user_member = next(
            (member for member in board.members if str(member.user_id) == str(user_id)),
            None,
        )

        if not user_member:
            continue

        result.append(
            AllowBoard(
                id=board.id,
                title=board.title,
                description=board.description,
                is_public=board.is_public,
                color=board.color,
                role=user_member.role,
            )
        )
    return result


async def get_all_users_own_boards(user_id: UUID) -> List[Board]:
    """Получение всех досок, где пользователь создатель

    Args:
        user_id (UUID): идентификатор пользователя

    Returns:
        List[AllowBoard]: массив досок
    """
    boards = (
        await Board.filter(
            members__user_id=user_id,
            members__role__in=[UserRole.creator],
        )
        .prefetch_related("members")
        .all()
    )

    result = []
    for board in boards:
        user_member = next(
            (member for member in board.members if str(member.user_id) == str(user_id)),
            None,
        )

        if not user_member:
            continue
        result.append(board)

    #     result.append(
    #         AllowBoard(
    #             id=board.id,
    #             title=board.title,
    #             description=board.description,
    #             is_public=board.is_public,
    #             color=board.color,
    #         )
    #     )
    return result


async def get_full_board_data(uuid: UUID) -> Optional[AbsoluteFullBoardInfo]:
    """Получение максимально подробной информации о доске

    Args:
        uuid (UUID): идентификатор доски

    Returns:
        Optional[AbsoluteFullBoardInfo]: информация о доски или `None`, если доски нет в базе
    """
    board = await Board.get_or_none(id=uuid).prefetch_related(
        "columns__tasks__subtasks",
        "columns__tasks__comments",
    )

    if not board:
        return None

    columns_out = []
    for column in board.columns:
        tasks = []
        for task in column.tasks:
            subtasks = task.subtasks
            comments = task.comments
            total = len(subtasks)
            completed = sum(1 for s in subtasks if s.is_completed)
            responsibles = await TaskResponsible.filter(task_id=task.id)
            responsibles_out = []
            for resp in responsibles:
                user = await User.get(id=resp.user_id)
                responsibles_out.append(
                    UserPreview(
                        id=user.id, username=user.username, avatar_url=user.avatar_url
                    )
                )
            if task.status not in [Status.done, Status.reject]:
                tasks.append(
                    TaskShortOut(
                        id=task.id,
                        title=task.title,
                        position=task.position,
                        priority=task.priority,
                        status=task.status,
                        color=task.color,
                        completed_subtasks=completed,
                        responsibles=responsibles_out,
                        due_date=task.due_date,
                        total_subtasks=total,
                        subtasks=subtasks,
                        total_comments=len(comments),
                    )
                )
            tasks.sort(key=lambda x: x.position)
        columns_out.append(
            ColumnOut(
                id=column.id,
                title=column.title,
                position=column.position,
                color=column.color,
                tasks=tasks,
            )
        )

    columns_out.sort(key=lambda x: x.position)

    return AbsoluteFullBoardInfo(board=board, columns=columns_out)


async def create_board(
    title: str,
    description: Optional[str],
    is_public: bool,
    color: Optional[str],
    creator_id: UUID,
) -> Optional[str]:
    """Создание доски

    Args:
        title (str): название доски
        description (Optional[str]): описание доски
        is_public (bool): публичная ил приватная доска. Изначально публичная
        color (Optional[str]): цвет доски
        creator_id (UUID): идентификатор создателя

    Returns:
        Optional[str]: идентификатор созданной доски
    """
    try:
        board = await Board.create(
            title=title, description=description, is_public=is_public, color=color
        )
        await BoardUser.create(
            user_id=creator_id, board_id=board.id, role=UserRole.creator
        )

        return str(board.id)
    except IntegrityError:
        return None


async def create_column(
    board_id: UUID, title: str, position: int, color: Optional[str]
) -> Optional[Column]:
    """Создание колонки

    Args:
        board_id (UUID): идентификатор доски
        title (str): название колонки
        position (int): позиция колонки
        color (Optional[str]): цвет колонки

    Returns:
        Optional[Column]: созданная колонка или `None`, если не создалась
    """
    try:
        return await Column.create(
            board_id=board_id, title=title, position=position, color=color
        )
    except IntegrityError:
        return None


async def get_comments(id: UUID) -> List[CommentData]:
    """Получение комментариев доски

    Args:
        id (UUID): идентификатор доски

    Returns:
        List[CommentData]: массив комментариев
    """
    board = await Board.get(id=id).prefetch_related("comments__user")
    res = []
    for comment in board.comments:
        res.append(
            CommentData(
                id=comment.id,
                board_id=comment.board_id,
                content=comment.content,
                created_at=comment.created_at,
                user=UserPreview(
                    id=comment.user.id,
                    username=comment.user.username,
                    avatar_url=comment.user.avatar_url,
                ),
            )
        )
    return res


async def create_comment(id: UUID, user_id: str, text: str) -> Optional[BoardComment]:
    """Создание комментария на доске

    Args:
        id (UUID): идентификатор доски
        user_id (str): идентификатор пользователя
        text (str): текст комментария

    Returns:
        Optional[BoardComment]: созданный комментарий или None, если не удалось создать
    """
    try:
        return await BoardComment.create(user_id=UUID(user_id), board_id=id, content=text)
    except IntegrityError:
        return None


async def get_members(board_id: UUID) -> List[BoardUserPreview]:
    """Получение списка участников доски

    Args:
        board_id (UUID): идентификатор доски

    Returns:
        List[BoardUserPreview]: список участников доски
    """
    members_data = await Board.get(id=board_id).prefetch_related(
        "members", "members__user"
    )
    members = []
    for member in members_data.members:
        members.append(
            BoardUserPreview(
                id=member.user.id,
                username=member.user.username,
                avatar_url=member.user.avatar_url,
                role=member.role,
            )
        )
    return members


async def add_member(board_id: UUID, user_id: UUID) -> Optional[BoardUser]:
    """Добавление участника на доску

    Args:
        board_id (UUID): идентификатор доски
        user_id (UUID): идентификатор пользователя

    Returns:
        Optional[BoardUser]: объект участника доски или None, если не удалось добавить
    """
    try:
        row, _ = await BoardUser.get_or_create(board_id=board_id, user_id=user_id)
        return row
    except IntegrityError:
        return None


async def change_member_role(board_id: UUID, member_id: UUID, role: UserRole) -> bool:
    """Изменение роли участника на доске

    Args:
        board_id (UUID): идентификатор доски
        member_id (UUID): идентификатор участника
        role (UserRole): новая роль

    Returns:
        bool: True, если роль успешно изменена, иначе False
    """
    board_member = await BoardUser.get_or_none(board_id=board_id, user_id=member_id)
    if not board_member:
        return False
    board_member.role = role
    await board_member.save()

    return True


async def delete_member(board_id: UUID, member_id: UUID) -> bool:
    """Удаление участника с доски

    Args:
        board_id (UUID): идентификатор доски
        member_id (UUID): идентификатор участника

    Returns:
        bool: True, если участник успешно удалён, иначе False
    """
    board_member = await BoardUser.get_or_none(board_id=board_id, user_id=member_id)
    if not board_member:
        return False

    tasks = await Task.filter(column__board_id=board_id).all()
    task_ids = [task.id for task in tasks]
    await TaskResponsible.filter(task_id__in=task_ids, user_id=member_id).delete()

    await board_member.delete()

    return True


async def delete_board(id: UUID) -> bool:
    """Удаление доски

    Args:
        id (UUID): идентификатор доски

    Returns:
        bool: True, если доска успешно удалена, иначе False
    """
    board = await Board.get_or_none(id=id)
    if not board:
        return False
    await board.delete()

    return True


async def update_fields(column_id: UUID, fields: Dict[str, Any]) -> bool:
    """Обновление полей объекта (например, колонки или доски)

    Args:
        column_id (UUID): идентификатор объекта
        fields (Dict[str, Any]): словарь обновляемых полей

    Returns:
        bool: True, если обновление прошло успешно, иначе False
    """
    board = await Board.get(id=column_id)

    for key, val in fields.items():
        setattr(board, key, val)

    try:
        await board.save(update_fields=list(fields.keys()))
        return True
    except Exception:
        return False


async def get_tasks_with_status(board_id: UUID) -> List[Task]:
    """Получение задач доски со статусом DONE или REJECT

    Args:
        board_id (UUID): идентификатор доски

    Returns:
        List[Task]: список задач с нужными статусами
    """
    tasks = await Task.filter(
        column__board_id=board_id, status__in=[Status.done, Status.reject]
    ).all()
    return tasks
