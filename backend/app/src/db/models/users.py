from tortoise import fields, models
import uuid
from .boards import Comment, BoardUser

class User(models.Model):
  id = fields.UUIDField(pk=True, default=uuid.uuid4)
  username = fields.CharField(max_length=150)
  email = fields.CharField(max_length=255, unique=True)
  phone = fields.CharField(max_length=20, null=True)
  avatar_url = fields.CharField(max_length=255, null=True)
  registered_at = fields.DatetimeField(auto_now_add=True)
  is_admin = fields.BooleanField(default=False)
  hashed_password = fields.TextField()

  boards: fields.ReverseRelation["BoardUser"]
  comments: fields.ReverseRelation["Comment"]

  class Meta:
    table = "users"
