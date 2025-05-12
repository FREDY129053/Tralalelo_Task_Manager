# Здесь собраны все схемы запросов, ответов для хэндлеров
from .user import CreateUser, BaseUserInfo, FullInfo, Login
from .board import FullBoardInfo, AbsoluteFullBoardInfo

__all__ = [
  "CreateUser",
  "BaseUserInfo",
  "FullInfo",
  "Login",
  "FullBoardInfo",
  "AbsoluteFullBoardInfo",
]