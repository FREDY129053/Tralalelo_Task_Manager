from uuid import UUID

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

import backend.app.src.services.comment as CommentService

comment_router = APIRouter(prefix="/comments", tags=["Comments Endpoints"])


@comment_router.delete("/{uuid}")
async def delete_comment(uuid: UUID):
    res = await CommentService.delete_comment(uuid=uuid)
    if not res:
        raise HTTPException(status_code=404, detail="subtask not found")

    return JSONResponse(content={"message": "subtask deleted"})
