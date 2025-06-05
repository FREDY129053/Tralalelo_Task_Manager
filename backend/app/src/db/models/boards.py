import uuid

from tortoise import fields, models

from backend.app.src.enums import Priority, Status, UserRole


class Board(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    is_public = fields.BooleanField(default=True)
    color = fields.CharField(max_length=7, null=True)

    columns: fields.ReverseRelation["Column"]
    members: fields.ReverseRelation["BoardUser"]
    comments: fields.ReverseRelation["BoardComment"]

    class Meta:
        table = "boards"


class BoardComment(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    board = fields.ForeignKeyField(
        "models.Board", related_name="comments", on_delete=fields.CASCADE
    )
    user = fields.ForeignKeyField(
        "models.User", related_name="board_comments", null=True, on_delete=fields.SET_NULL
    )
    content = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "board_comments"


class BoardUser(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField(
        "models.User", related_name="boards", on_delete=fields.CASCADE
    )
    board = fields.ForeignKeyField(
        "models.Board", related_name="members", on_delete=fields.CASCADE
    )
    role = fields.CharEnumField(UserRole, default=UserRole.member)

    class Meta:
        table = "board_users"


class Column(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    board = fields.ForeignKeyField(
        "models.Board", related_name="columns", on_delete=fields.CASCADE
    )
    title = fields.CharField(max_length=255)
    position = fields.IntField()
    color = fields.CharField(max_length=7, null=True)

    tasks: fields.ReverseRelation["Task"]

    class Meta:
        table = "columns"


class Task(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    column = fields.ForeignKeyField(
        "models.Column", related_name="tasks", on_delete=fields.CASCADE
    )
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    position = fields.IntField()
    due_date = fields.DatetimeField(null=True)
    priority = fields.CharEnumField(Priority, default=Priority.low)
    status = fields.CharEnumField(Status, default=Status.to_do)
    color = fields.CharField(max_length=20, null=True)
    # responsible = fields.ForeignKeyField(
    #     "models.User", related_name="responsible_tasks", null=True
    # )

    subtasks: fields.ReverseRelation["Subtask"]
    comments: fields.ReverseRelation["Comment"]
    responsibles: fields.ReverseRelation["TaskResponsible"]

    class Meta:
        table = "tasks"


class Subtask(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    task = fields.ForeignKeyField(
        "models.Task", related_name="subtasks", on_delete=fields.CASCADE
    )
    title = fields.CharField(max_length=255)
    is_completed = fields.BooleanField(default=False)

    class Meta:
        table = "subtasks"


class Comment(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    task = fields.ForeignKeyField(
        "models.Task", related_name="comments", on_delete=fields.CASCADE
    )
    user = fields.ForeignKeyField(
        "models.User", related_name="comments", null=True, on_delete=fields.SET_NULL
    )
    content = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "comments"


class TaskResponsible(models.Model):
    id = fields.IntField(pk=True)

    task = fields.ForeignKeyField(
        "models.Task", related_name="responsibles", on_delete=fields.CASCADE
    )
    user = fields.ForeignKeyField(
        "models.User", related_name="task_responsibilities", on_delete=fields.CASCADE
    )

    class Meta:
        table = "task_responsibles"


class Notification(models.Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=255)
    text = fields.TextField()
    is_read = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    user = fields.ForeignKeyField(
        "models.User", related_name="notifications", on_delete=fields.CASCADE
    )

    class Meta:
        table = "notifications"
