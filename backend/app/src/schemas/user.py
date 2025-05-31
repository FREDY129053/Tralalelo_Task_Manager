from datetime import datetime
from uuid import uuid4

from pydantic import UUID4, BaseModel, EmailStr
from pydantic_extra_types.phone_numbers import PhoneNumber

from backend.app.src.enums import UserRole


class BaseUserInfo(BaseModel):
    username: str
    email: EmailStr
    phone: str | None = None
    avatar_url: str | None = None
    is_admin: bool = False
    hashed_password: str


class CreateUser(BaseUserInfo):
    id: UUID4 = uuid4()


class RegUser(BaseModel):
    username: str
    email: EmailStr
    phone: PhoneNumber | None = None
    password: str


class FullInfo(CreateUser):
    registered_at: datetime


class Login(BaseModel):
    username: str
    password: str


class UserPreview(BaseModel):
    id: UUID4
    username: str
    avatar_url: str | None


class BoardUserPreview(UserPreview):
    role: UserRole


class UpdatePass(BaseModel):
    old_password: str
    new_password: str
