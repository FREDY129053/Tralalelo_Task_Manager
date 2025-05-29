# Здесь собираются все модели, чтобы импортировать можно было из модуля, а не из файлов двух
from .boards import Board, BoardComment, BoardUser, Column, Comment, Subtask, Task
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
]
