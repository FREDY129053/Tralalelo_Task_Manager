import re
import typing
from datetime import datetime
from typing import List, Optional, Annotated
from uuid import UUID

from pydantic import BaseModel, ValidationError, field_validator, AfterValidator, Field
from tortoise.contrib.pydantic import pydantic_model_creator

from backend.app.src.db.models import Board, BoardUser, Column, Comment, Subtask, Task
from backend.app.src.enums import Priority, Status


def _is_valid_color(value: str) -> str:
    if value is not None:
        regex = re.compile("^#[a-f0-9]{6}$")
        if not regex.match(value):
            raise ValidationError(f"{value} is not valid HEX color code")

    return value


FullBoardInfo = typing.NewType(
    "FullBoardInfo",
    pydantic_model_creator(
        Board, name="Board", validators={"color": field_validator("color")(_is_valid_color)}
    ),
)
FullColumnInfo = typing.NewType(
    "FullColumnInfo",
    pydantic_model_creator(
        Column, name="Column", validators={"color": field_validator("color")(_is_valid_color)}
    ),
)
FullTaskInfo = typing.NewType(
    "FullTaskInfo",
    pydantic_model_creator(
        Task, name="Task", validators={"color": field_validator("color")(_is_valid_color)}
    ),
)
FullSubtaskInfo = typing.NewType("FullSubtaskInfo", pydantic_model_creator(Subtask, name="Subtask"))
FullCommentInfo = typing.NewType("FullCommentInfo", pydantic_model_creator(Comment, name="Comment"))
BoardUserInfo = typing.NewType("BoardUserInfo", pydantic_model_creator(BoardUser, name="BoardUser"))

class CreateBoard(BaseModel):
    title: str
    description: str | None = None
    is_public: bool = True
    color: Annotated[Optional[str], AfterValidator(_is_valid_color)] = Field(default=None, description="Hex color, e.g. #000000")

class UpdateColumnsPos(BaseModel):
    col_id: UUID
    new_pos: int

class UpdateTaskInfo(BaseModel):
    task_id: UUID
    col_id: UUID
    position: int

class CreateColumn(BaseModel):
    title: str
    position: int
    color: Annotated[Optional[str], AfterValidator(_is_valid_color)] = Field(default=None, description="Hex color, e.g. #000000")

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Priority = Priority.low
    status: Status = Status.to_do
    color: Annotated[Optional[str], AfterValidator(_is_valid_color)] = Field(default=None, description="Hex color, e.g. #000000")
    responsible: Optional[UUID] = None

class SubtaskCreate(BaseModel):
    title: str
    is_completed: bool = False

class CommentCreate(BaseModel):
    content: str

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


class TaskShortOut(BaseModel):
    id: UUID
    title: str
    position: int
    priority: Priority
    status: Status
    color: Optional[str]
    responsible_id: Optional[UUID]

    subtasks: List[SubtaskOut]

    class Config:
        from_attributes = True

class TaskOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    position: int
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
    tasks: List[TaskShortOut]

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
