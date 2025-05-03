from tortoise import fields, models
from .boards import Comment, BoardUser

class User(models.Model):
  id = fields.UUIDField(pk=True)
  username = fields.CharField(max_length=150)
  email = fields.CharField(max_length=255, unique=True)
  phone = fields.CharField(max_length=20, null=True)
  avatar_url = fields.CharField(max_length=255, null=True)

  boards: fields.ReverseRelation["BoardUser"]
  comments: fields.ReverseRelation["Comment"]

  class Meta:
    table = "users"