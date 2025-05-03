import uuid

from app.src.enums import Priority, Status, UserRole
from tortoise import fields, models


class Board(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    is_public = fields.BooleanField(default=True)

    columns: fields.ReverseRelation["Column"]
    members: fields.ReverseRelation["BoardUser"]


class BoardUser(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="boards", on_delete=fields.CASCADE)
    board = fields.ForeignKeyField("models.Board", related_name="members", on_delete=fields.CASCADE)
    role = fields.CharEnumField(UserRole, default=UserRole.member)

    class Meta: ...


class Column(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    board = fields.ForeignKeyField("models.Board", related_name="columns", on_delete=fields.CASCADE)
    title = fields.CharField(max_length=255)
    position = fields.IntField()

    tasks: fields.ReverseRelation["Task"]


class Task(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    column = fields.ForeignKeyField("models.Column", related_name="tasks", on_delete=fields.CASCADE)
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    due_date = fields.DatetimeField(null=True)
    priority = fields.CharEnumField(Priority, default=Priority.low)
    status = fields.CharEnumField(Status, default=Status.to_do)
    color = fields.CharField(max_length=20, null=True)

    subtasks: fields.ReverseRelation["Subtask"]
    comments: fields.ReverseRelation["Comment"]


class Subtask(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    task = fields.ForeignKeyField("models.Task", related_name="subtasks", on_delete=fields.CASCADE)
    title = fields.CharField(max_length=255)
    is_completed = fields.BooleanField(default=False)


class Comment(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    task = fields.ForeignKeyField("models.Task", related_name="comments", on_delete=fields.CASCADE)
    user = fields.ForeignKeyField(
        "models.User", related_name="comments", null=True, on_delete=fields.SET_NULL
    )
    content = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)
