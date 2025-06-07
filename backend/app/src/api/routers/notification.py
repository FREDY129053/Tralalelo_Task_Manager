from typing import List

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

import backend.app.src.services.notification as NotificationService
from backend.app.src.schemas import CreateNotification, NotificationInfo

notification_router = APIRouter(prefix="/notification", tags=["Notifications Endpoints"])


@notification_router.get("/", response_model=List[NotificationInfo])
async def get_all_notifications():
    return await NotificationService.get_all_notifications()


@notification_router.post("/")
async def create_notification(data: CreateNotification):
    await NotificationService.create_notification(notification=data)

    return JSONResponse(
        content={"message": "created"}, status_code=status.HTTP_201_CREATED
    )
