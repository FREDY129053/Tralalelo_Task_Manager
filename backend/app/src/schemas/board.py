import re
import typing
from datetime import datetime
from typing import Annotated, List, Optional
from uuid import UUID

from pydantic import AfterValidator, BaseModel, Field, ValidationError, field_validator
from tortoise.contrib.pydantic import pydantic_model_creator

from backend.app.src.db.models import Board
from backend.app.src.enums import Priority, Status
from backend.app.src.enums.role import UserRole
from backend.app.src.schemas.user import UserPreview


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


class ColorMixin(BaseModel):
    color: Annotated[Optional[str], AfterValidator(_is_valid_color)] = Field(
        default=None, description="Hex color, e.g. #000000"
    )


class TitleMixin(BaseModel):
    title: str


class PositionMixin(BaseModel):
    position: int


class CreateBoard(ColorMixin, TitleMixin):
    description: str | None = None
    is_public: bool = True


class UpdateColumnsPos(BaseModel):
    col_id: UUID
    new_pos: int


class UpdateTaskPos(UpdateColumnsPos):
    task_id: UUID


class CreateColumn(ColorMixin, TitleMixin, PositionMixin): ...


class UpdateColumn(ColorMixin):
    title: Optional[str] = None


class CommentData(BaseModel):
    id: UUID
    board_id: UUID
    content: str
    created_at: datetime
    user: UserPreview


class UpdateBoard(UpdateColumn):
    is_public: Optional[bool] = None
    description: Optional[str] = None


class TaskCreate(ColorMixin, TitleMixin, PositionMixin):
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Priority = Priority.low
    status: Status = Status.to_do
    responsible: Optional[UUID] = None


class TaskUpdate(ColorMixin):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
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
    user: Optional[UserPreview]

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


class BaseTaskOut(BaseModel):
    id: UUID
    title: str
    position: int
    priority: Priority
    status: Status
    color: Optional[str]
    due_date: Optional[datetime]
    responsibles: List[UserPreview]
    total_subtasks: int
    completed_subtasks: int
    subtasks: List[SubtaskOut]

    class Config:
        from_attributes = True


class TaskShortOut(BaseTaskOut):
    total_comments: int


class TaskOut(BaseTaskOut):
    description: Optional[str]
    comments: List[CommentOut]


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
