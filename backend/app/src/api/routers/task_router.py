from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import JSONResponse

import backend.app.src.services.task as TaskService
from backend.app.src.schemas import SubtaskCreate, CommentCreate

task_router = APIRouter(prefix='/tasks', tags=["Tasks Endpoints"])

@task_router.post('/{uuid}/comments')
async def write_comment(uuid: UUID, comment_info: CommentCreate, request: Request):
  token = request.cookies.get("user", None)
  if not token:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="not authorized"
    )
  
  is_created = await TaskService.create_comment(uuid=uuid, comment_data=comment_info, token=token)

  if not is_created:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="invalid data idk"
    )
  
  return JSONResponse(
    content={"message": "comment created"},
    status_code=status.HTTP_201_CREATED
  )

@task_router.post("/{uuid}/subtasks")
async def create_subtask(uuid: UUID, subtask_info: SubtaskCreate):
  is_created = await TaskService.create_subtask(uuid=uuid, subtask_data=subtask_info)
  if not is_created:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="invalid data"
    )
  
  return JSONResponse(
    content={"message": "subtask created"},
    status_code=status.HTTP_201_CREATED
  )

@task_router.patch("/{uuid}")
async def update_task_info(uuid: UUID, col_id: UUID):
  res = await TaskService.update_task_data(task_id=uuid, col_id=col_id)
  if not res:
    raise HTTPException(
      status_code=400,
      detail="troubles"
    )
  
  return JSONResponse(
    content={"message": "ok"},
  )