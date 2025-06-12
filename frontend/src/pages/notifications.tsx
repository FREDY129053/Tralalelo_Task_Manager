import NotificationList from "@/components/NotificationList";
import { INotification } from "@/interfaces/Board";
import { useEffect, useState } from "react";
import { deleteNotification, getNotifications, updateNotificationReadStatus } from "./api/notification";

// const notifications = [
//   {
//     id: 1,
//     title: "Hz",
//     text: "string;",
//     is_read: false,
//     created_at: "2025-06-07T14:13:50.127554Z",
//   },
//   {
//     id: 2,
//     title: "dasdasdasdasd",
//     text: "afdsgfhgfdsgfhdsgfsdfgsdhfgsdhjgfhjgfsjhfgsfgsdfhjsfgsjhfgsdfjgdsfhjsdgfsdfgsdfgsdfhsdfgsdhgfsdhfgsdhfgsdhjfhgsdfhsdgfshjfgsdhjfgsdfjgsdfhjsdgfsjdjfgsdjhfgsdf;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 3,
//     title: "Hz",
//     text: "Завтра срок задачи **fds** в колонке **To Do** на доске **Project A**.\nСсылка: http://localhost:3000/boards/1ecb27cb-d670-4e63-a1d1-1f77b2ca2ed4",
//     is_read: false,
//     created_at: "2025-06-07T14:13:50.127554Z",
//   },
//   {
//     id: 4,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "2025-06-07T14:13:50.127554Z",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: false,
//     created_at: "2025-06-07T14:13:50.127554Z",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
//   {
//     id: 5,
//     title: "Hz",
//     text: "string;",
//     is_read: true,
//     created_at: "",
//   },
// ];

export default function NotificationPage() {
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
