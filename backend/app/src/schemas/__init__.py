# Здесь собраны все схемы запросов, ответов для хэндлеров
from .board import (
    AbsoluteFullBoardInfo,
    CommentCreate,
    CreateBoard,
    CreateColumn,
    FullBoardInfo,
    FullColumnInfo,
    FullCommentInfo,
    FullSubtaskInfo,
    FullTaskInfo,
    SubtaskCreate,
    TaskCreate,
    UpdateColumnsPos,
    UpdateTaskInfo,
    TaskUpdate,
    ColumnOut,
    TaskShortOut,
    BoardOut
)
from .user import BaseUserInfo, CreateUser, FullInfo, Login, RegUser

__all__ = [
    "CreateUser",
    "BaseUserInfo",
    "RegUser",
    "FullInfo",
    "Login",
    "FullBoardInfo",
    "AbsoluteFullBoardInfo",
    "FullColumnInfo",
    "FullTaskInfo",
    "FullSubtaskInfo",
    "FullCommentInfo",
    "CreateColumn",
    "TaskCreate",
    "SubtaskCreate",
    "CommentCreate",
    "CreateBoard",
    "UpdateColumnsPos",
    "UpdateTaskInfo",
    "TaskUpdate",
    "ColumnOut",
    "TaskShortOut",
    "BoardOut"
]
