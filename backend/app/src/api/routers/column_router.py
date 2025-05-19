from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from typing import List
import backend.app.src.services.column as ColumnService
from backend.app.src.schemas import TaskCreate, UpdateColumnsPos


column_router = APIRouter(prefix='/columns', tags=["Columns Endpoints"])

@column_router.delete('/{uuid}')
async def delete_column(uuid: UUID):
  result = await ColumnService.delete_column(uuid=uuid)

  if not result:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="column not found"
    )
  
  return JSONResponse(
    content={"message": "column deleted"},
    status_code=status.HTTP_200_OK
  )

@column_router.post('/{uuid}/tasks')
async def create_task(uuid: UUID, task_data: TaskCreate):
  is_created = await ColumnService.create_task(uuid=uuid, task_data=task_data)

  if not is_created:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="invalid data(column or responsible user)"
    )
  
  return JSONResponse(
    content={"message": "task created"},
    status_code=status.HTTP_201_CREATED
  )

@column_router.patch("/update_positions")
async def update_columns_positions(data: List[UpdateColumnsPos]):
  result = await ColumnService.update_cols_positions(data=data)

  if not result:
    raise HTTPException(
      status_code=400,
      detail="cannot update positions"
    )
  
  return JSONResponse(
    content={"message": "updated successfully"},
    status_code=status.HTTP_200_OK
  )