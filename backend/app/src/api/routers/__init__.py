# В данной папке собраны все роутеры(хэндлеры с припиской определенной) проекта
from fastapi import APIRouter
from .user_router import user_router

# В этом файле собирается общий роутер проекта
router = APIRouter(prefix='/api')

router.include_router(user_router)