from uuid import uuid4
from datetime import datetime
from pydantic import BaseModel, UUID4

class BaseUserInfo(BaseModel):
  username: str
  email: str
  phone: str | None = None
  avatar_url: str | None = None
  is_admin: bool = False
  hashed_password: str

class CreateUser(BaseUserInfo):
  id: UUID4 = uuid4()
  
class FullInfo(CreateUser):
  registered_at: datetime

class Login(BaseModel):
  username: str
  password: str