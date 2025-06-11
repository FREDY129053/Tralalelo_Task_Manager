import re
import typing
from datetime import datetime
from typing import Annotated, List, Optional
from uuid import UUID

from pydantic import AfterValidator, BaseModel, Field, ValidationError, field_validator
from tortoise.contrib.pydantic import pydantic_model_creator

from backend.app.src.db.models import Board, BoardUser, Column, Comment, Subtask, Task
from backend.app.src.enums import Priority, Status
from backend.app.src.enums.role import UserRole


def _is_valid_color(value: str) -> str:
    if value is not None:
        regex = re.compile("^#[a-f0-9]{6}$")
        if not regex.match(value.lower()):
            raise ValidationError(f"{value} is not valid HEX color code")

        return value.lower()

    return value


FullBoardInfo = typing.NewType(
    "FullBoardInfo",
    pydantic_model_creator(
        Board,
        name="Board",
        validators={"color": field_validator("color")(_is_valid_color)},
    ),
)
FullColumnInfo = typing.NewType(
    "FullColumnInfo",
    pydantic_model_creator(
        Column,
        name="Column",
        validators={"color": field_validator("color")(_is_valid_color)},
    ),
)
FullTaskInfo = typing.NewType(
    "FullTaskInfo",
    pydantic_model_creator(
        Task, name="Task", validators={"color": field_validator("color")(_is_valid_color)}
    ),
)
FullSubtaskInfo = typing.NewType(
    "FullSubtaskInfo", pydantic_model_creator(Subtask, name="Subtask")
)
FullCommentInfo = typing.NewType(
    "FullCommentInfo", pydantic_model_creator(Comment, name="Comment")
)
BoardUserInfo = typing.NewType(
    "BoardUserInfo", pydantic_model_creator(BoardUser, name="BoardUser")
)


class UserShortInfo(BaseModel):
    id: UUID
    username: str
    avatar_url: str | None


class CreateBoard(BaseModel):
    title: str
    description: str | None = None
    is_public: bool = True
    color: Annotated[Optional[str], AfterValidator(_is_valid_color)] = Field(
        default=None, description="Hex color, e.g. #000000"
    )


class UpdateColumnsPos(BaseModel):
    col_id: UUID
    new_pos: int


class UpdateTaskPos(BaseModel):
    col_id: UUID
    task_id: UUID
    position: int


class UpdateTaskInfo(BaseModel):
    task_id: UUID
    col_id: UUID
    position: int


class CreateColumn(BaseModel):
    title: str
    position: int
    color: Annotated[Optional[str], AfterValidator(_is_valid_color)] = Field(
        default=None, description="Hex color, e.g. #000000"
    )


class UpdateColumn(BaseModel):
    title: Optional[str] = None
    color: Annotated[Optional[str], AfterValidator(_is_valid_color)] = Field(
        default=None, description="Hex color, e.g. #000000"
    )


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    position: int
    due_date: Optional[datetime] = None
    priority: Priority = Priority.low
    status: Status = Status.to_do
    color: Annotated[Optional[str], AfterValidator(_is_valid_color)] = Field(
        default=None, description="Hex color, e.g. #000000"
    )
    responsible: Optional[UUID] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    color: Annotated[Optional[str], AfterValidator(_is_valid_color)] = Field(
        default=None, description="Hex color, e.g. #000000"
    )
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
    user: Optional[UserShortInfo]

    class Config:
        from_attributes = True


class SubtaskUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None


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
    due_date: Optional[datetime]
    responsibles: List[UserShortInfo]
    total_subtasks: int
    completed_subtasks: int
    total_comments: int

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
    responsibles: List[UserShortInfo]
    total_subtasks: int
    completed_subtasks: int

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


class AllowBoard(BoardOut):
    role: UserRole


class AbsoluteFullBoardInfo(BaseModel):
    board: BoardOut
    columns: List[ColumnOut]

    class Config:
        from_attributes = True
