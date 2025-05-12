import re
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ValidationError, field_validator
from tortoise.contrib.pydantic import pydantic_model_creator

from backend.app.src.db.models import Board, BoardUser, Column, Comment, Subtask, Task
from backend.app.src.enums import Priority, Status


def _is_valid_color(value: str) -> str:
    regex = re.compile("^#[a-f0-9]{6}$")
    if not regex.match(value):
        raise ValidationError(f"{value} is not valid HEX color code")

    return value


FullBoardInfo = pydantic_model_creator(
    Board, name="Board", validators={"color": field_validator("color")(_is_valid_color)}
)
FullColumnInfo = pydantic_model_creator(
    Column, name="Column", validators={"color": field_validator("color")(_is_valid_color)}
)
FullTaskInfo = pydantic_model_creator(
    Task, name="Task", validators={"color": field_validator("color")(_is_valid_color)}
)
FullSubtaskInfo = pydantic_model_creator(Subtask, name="Subtask")
FullCommentInfo = pydantic_model_creator(Comment, name="Comment")
BoardUserInfo = pydantic_model_creator(BoardUser, name="BoardUser")


class CommentOut(BaseModel):
    id: UUID
    content: str
    created_at: datetime
    user_id: Optional[UUID]

    class Config:
        from_attributes = True


class SubtaskOut(BaseModel):
    id: UUID
    title: str
    is_completed: bool

    class Config:
        from_attributes = True


class TaskOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    priority: Priority
    status: Status
    color: Optional[str]
    responsible_id: Optional[UUID]

    subtasks: List[SubtaskOut]
    comments: List[CommentOut]

    class Config:
        from_attributes = True


class ColumnOut(BaseModel):
    id: UUID
    title: str
    position: int
    color: Optional[str]
    tasks: List[TaskOut]

    class Config:
        from_attributes = True


class BoardOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    is_public: bool
    color: Optional[str]

    class Config:
        from_attributes = True


class AbsoluteFullBoardInfo(BaseModel):
    board: BoardOut
    columns: List[ColumnOut]

    class Config:
        from_attributes = True
