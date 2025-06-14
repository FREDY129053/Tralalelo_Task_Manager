from email.message import EmailMessage
from typing import Dict

from aiosmtplib import send

from backend.app.src.repository.notification import check_due_dates
from backend.app.src.services.notification import CreateNotification, create_notification

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465
SMTP_USER = "fredy1290534518@gmail.com"
SMTP_PASS = "soim qkiw wydz lkvj"


def build_message(data: Dict) -> str:
    task_name = data["task_name"]
    column_name = data["column_name"]
    board_name = data["board_name"]
    board_id = data["board_id"]
    offset = data["due_offset"]
    board_url = f"http://localhost:3000/boards/{board_id}"

    if offset == -1:
        msg = f'Задача **"{task_name}"** просрочена!'
    elif offset == 1:
        msg = f'Завтра срок задачи **"{task_name}"**'
    else:
        msg = f'Через {offset} дней — срок задачи **"{task_name}"**'

    return (
        f'{msg} в колонке **"{column_name}"** '
        f'на доске **"{board_name}"**.\n\n\nСсылка: {board_url}'
    )


async def send_email(to_email: str, subject: str, body: str):
    message = EmailMessage()
    message["From"] = SMTP_USER
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    await send(
        message,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        use_tls=True,
        username=SMTP_USER,
        password=SMTP_PASS,
    )


async def notify_users():
    tasks_by_days = await check_due_dates()

    for _, entries in tasks_by_days.items():
        for entry in entries:
            message = build_message(entry)
            subject = "⏰ Уведомление о сроке задачи"

            responsible_id = entry["user_id"]
            responsible_email = entry["user_email"]

            print(
                f"[SEND] → {responsible_email} (User ID: {responsible_id})\n{message}\n"
            )
            notification = CreateNotification(
                title="⏰ Уведомление о сроке задачи",
                text=message,
                user_id=responsible_id,
            )
            await create_notification(notification=notification)

            try:
                await send_email(responsible_email, subject, message)
            except Exception as e:
                print(f"[ERROR] Failed to send to {responsible_email}: {e}")

            if entry.get("creator_email"):
                creator_id = entry["creator_id"]
                creator_email = entry["creator_email"]

                print(f"[SEND TO CREATOR] → {creator_email} (ID: {creator_id})")
                notification = CreateNotification(
                    title="⏰ Уведомление о сроке задачи",
                    text=message,
                    user_id=creator_id,
                )
                await create_notification(notification=notification)

                try:
                    await send_email(creator_email, subject, message)
                except Exception as e:
                    print(f"[ERROR] Failed to send to {creator_email}: {e}")
