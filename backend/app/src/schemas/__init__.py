# Здесь собраны все схемы запросов, ответов для хэндлеров
from .user import CreateUser, BaseUserInfo, FullInfo, Login
from .board import FullBoardInfo, AbsoluteFullBoardInfo, FullColumnInfo, FullTaskInfo, FullSubtaskInfo, FullCommentInfo, CreateColumn, TaskCreate, SubtaskCreate, CommentCreate, CreateBoard

__all__ = [
  "CreateUser",
  "BaseUserInfo",
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
]