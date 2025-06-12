import { INotification } from "@/interfaces/Board";
import { apiFetch } from "./abstractFunctions";

export async function getNotifications(): Promise<INotification[]> {
  return apiFetch(
    "http://localhost:8080/api/notification/user_notifications",
    { method: "GET" },
    "Ошибка при получении уведомлений"
  );
}
export async function deleteNotification(id: number): Promise<void> {
  return apiFetch(
    `http://localhost:8080/api/notification/${id}`,
    { method: "DELETE" },
    "Ошибка при удалении уведомления"
  );
}
export async function updateNotificationReadStatus(
  id: number
): Promise<void> {
  return apiFetch(
    `http://localhost:8080/api/notification/${id}/fields`,
    { method: "PATCH", body: JSON.stringify({ is_read: true }) },
    "Ошибка при получении уведомлений"
  );
}
