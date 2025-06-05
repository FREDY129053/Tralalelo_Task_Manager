# Здесь собираются все модели, чтобы импортировать можно было из модуля, а не из файлов двух
from .boards import (
    Board,
    BoardComment,
    BoardUser,
    Column,
    Comment,
    Notification,
    Subtask,
    Task,
    TaskResponsible,
)
from .users import User

__all__ = [
    "User",
    "Board",
    "BoardUser",
    "Column",
    "Task",
    "Subtask",
    "Comment",
    "BoardComment",
    "Notification",
    "TaskResponsible",
]
