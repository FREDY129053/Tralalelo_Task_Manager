from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from uuid import UUID
from backend.app.src.schemas import SubtaskUpdate
import backend.app.src.services.subtask as SubtaskService

subtask_router = APIRouter(prefix="/subtasks", tags=["Subtasks Endpoints"])

@subtask_router.delete("/{uuid}")
async def delete_subtask(uuid: UUID):
  res = await SubtaskService.delete_subtask(uuid=uuid)
  if not res:
    raise HTTPException(
      status_code=404,
      detail="subtask not found"
    )
  
  return JSONResponse(
    content={"message": "subtask deleted"}
  )

@subtask_router.patch("/update/{uuid}")
async def update_subtask(uuid: UUID, data: SubtaskUpdate):
  res = await SubtaskService.update_subtask(uuid, data)

  if not res:
    raise HTTPException(
      status_code=400,
      detail="troubles"
    )
  
  return JSONResponse(
    content={"message": "ok"},
  )