from datetime import datetime
from typing import Optional

from pydantic import UUID4, BaseModel, EmailStr

from backend.app.src.enums import UserRole


class BaseUserInfo(BaseModel):
    username: str
    email: EmailStr
    avatar_url: Optional[str] = None
    is_admin: bool = False
    hashed_password: str


class RegUser(BaseModel):
    username: str
    email: EmailStr
    password: str


class FullInfo(BaseUserInfo):
    id: UUID4
    registered_at: datetime

    class Config:
        from_attributes = True


class Login(BaseModel):
    username: str
    password: str


class UserPreview(BaseModel):
    id: UUID4
    username: str
    avatar_url: Optional[str]


class BoardUserPreview(UserPreview):
    role: UserRole


class UpdatePass(BaseModel):
    old_password: str
    new_password: str
