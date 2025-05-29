# В данной папке собраны все роутеры(хэндлеры с припиской определенной) проекта
from fastapi import APIRouter

from .board_router import board_router
from .column_router import column_router
from .comment_router import comment_router
from .subtask_router import subtask_router
from .task_router import task_router
from .user_router import user_router

# В этом файле собирается общий роутер проекта
router = APIRouter(prefix="/api")

router.include_router(user_router)
router.include_router(board_router)
router.include_router(column_router)
router.include_router(task_router)
router.include_router(subtask_router)
router.include_router(comment_router)
