from typing import List

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse

import backend.app.src.services.notification as NotificationService
from backend.app.src.schemas import CreateNotification, NotificationInfo
from backend.app.src.schemas.notifications import UpdateNotification

notification_router = APIRouter(prefix="/notification", tags=["Notifications Endpoints"])


@notification_router.get("/", response_model=List[NotificationInfo])
async def get_all_notifications():
    return await NotificationService.get_all_notifications()


@notification_router.get("/user_notifications", response_model=List[NotificationInfo])
async def get_all_users_notifications(request: Request):
    token = request.cookies.get("user")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="not authorized"
        )

    return await NotificationService.get_all_users_notifications(token=token)


@notification_router.post("/")
async def create_notification(data: CreateNotification):
    await NotificationService.create_notification(notification=data)

    return JSONResponse(
        content={"message": "created"}, status_code=status.HTTP_201_CREATED
    )


@notification_router.patch("/{id}/fields")
async def update_notification(id: int, data: UpdateNotification):
    await NotificationService.update_fields(id, data)

    return JSONResponse(content={"message": "updated"})


@notification_router.delete("/{id}")
async def delete_notification(id: int):
    await NotificationService.delete_notification(id)

    return JSONResponse(content={"message": "deleted"})
