from enum import StrEnum

class UserRole(StrEnum):
  creator = "CREATOR"
  moderator = "MODERATOR"
  member = "MEMBER"