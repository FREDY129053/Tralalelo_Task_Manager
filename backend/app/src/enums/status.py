from enum import StrEnum

class Status(StrEnum):
  to_do = "TODO"
  in_progress = "IN_PROGRESS"
  done = "DONE"
  reject = "REJECT"