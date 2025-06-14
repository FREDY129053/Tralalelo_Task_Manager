import NotificationList from "@/components/NotificationList";
import { INotification } from "@/interfaces/Board";
import { useEffect, useState } from "react";
import { deleteNotification, getNotifications, updateNotificationReadStatus } from "./api/notification";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function NotificationPage() {
  useAuthRedirect()
  const [notifications, setNotifications] = useState<INotification[]>([])

  const handleDelete = async (id: number) => {
    await deleteNotification(id)
    getNotifications().then(setNotifications).catch(console.error)
  }
  const handleUpdateNotification = async (id: number) => {
    await updateNotificationReadStatus(id)
    getNotifications().then(setNotifications).catch(console.error)
  }

  useEffect(() => {
    getNotifications().then(setNotifications).catch(console.error)
  }, [])

  return <NotificationList notifications={notifications} onDelete={handleDelete} onRead={handleUpdateNotification}/>;
}
