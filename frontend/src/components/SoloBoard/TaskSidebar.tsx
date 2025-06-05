import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IFullTask } from "@/interfaces/Board";
import { IoMdClose } from "react-icons/io";
import {
  createSubTask,
  deleteSubTask,
  getTask,
  updateTask,
} from "@/pages/api/board";
import { FaTrashAlt } from "react-icons/fa";
import returnDate from "@/helpers/NormalDate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  task: IFullTask | null;
  onClose: () => void;
  onBoardUpdate: () => void;
};

export default function TaskSidebar({ task, onClose, onBoardUpdate }: Props) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarTask, setSidebarTask] = useState<IFullTask | null>(task);
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);

  // Сброс локального состояния при открытии новой задачи
  useEffect(() => {
    setSidebarTask(task);
    setNewDueDate(task?.due_date ? new Date(task.due_date) : null);
  }, [task]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    if (sidebarTask) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarTask, onClose]);

  if (!sidebarTask) return null;

  const updateEvent = async () => {
    const updatedTask = await getTask(sidebarTask.id);
    setSidebarTask(updatedTask);
    onBoardUpdate();
  };

  const handleAddSubtask = async () => {
    const title = prompt("Введите название");
    if (!title) return;
    await createSubTask(sidebarTask.id, title);
    await updateEvent();
  };

  const handleDeleteSubtask = async (subtaskID: string) => {
    await deleteSubTask(subtaskID);
    await updateEvent();
  };

  const getAPIDateFormat = async (date: Date | null) => {
    if (!date) {
      setNewDueDate(null);
      await updateTask(task!.id, "due_date", null);
      return;
    }
    const dateForAPI = date.toISOString();
    setNewDueDate(date);
    await updateTask(task!.id, "due_date", dateForAPI);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex justify-end pointer-events-none">
      <div
        ref={sidebarRef}
        className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col overflow-y-auto pointer-events-auto"
        style={{ zIndex: 100000 }}
      >
        <button
          className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Закрыть"
          type="button"
        >
          <IoMdClose />
        </button>
        <h2 className="text-2xl font-bold mb-2">{sidebarTask.title}</h2>
        <button
          className="mb-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition font-semibold"
          onClick={handleAddSubtask}
        >
          Добавить подзадачу
        </button>
        <div className="mb-2 text-gray-500 text-sm">
          <span className="mr-4">ID: {sidebarTask.id}</span>
          <span>Позиция: {sidebarTask.position}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Приоритет: </span>
          <span>{sidebarTask.priority}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Статус: </span>
          <span>{sidebarTask.status}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Ответственный: </span>
          <span>{sidebarTask.responsibles.map((res) => (
            <p key={res.id}>{res.username}</p>
          ))}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Срок: </span>
          <DatePicker
            showIcon
            showDisabledMonthNavigation={true}
            minDate={new Date()}
            selected={newDueDate}
            onChange={getAPIDateFormat}
            placeholderText="Выберите дату"
            className="border border-gray-300 rounded px-2 py-1 w-full focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition"
            calendarClassName="!z-[100001]"
            dateFormat="dd.MM.yyyy"
            isClearable
          />
        </div>
        <div className="mb-2">
          <span className="font-semibold">Цвет: </span>
          <span>
            {sidebarTask.color ? (
              <span
                className="inline-block w-4 h-4 rounded-full align-middle"
                style={{ background: sidebarTask.color }}
              />
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Подзадачи: </span>
          <span>
            {sidebarTask.completed_subtasks} / {sidebarTask.total_subtasks}
          </span>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Список подзадач:</span>
          <div className="ml-6 space-y-4">
            {sidebarTask.subtasks.map((sub) => (
              <div
                key={sub.id}
                className={`border border-amber-400 ${sub.is_completed ? "line-through text-gray-400" : ""}`}
              >
                <div className="flex justify-between items-center">
                  {sub.title}
                  <button
                    className="cursor-pointer"
                    onClick={() => handleDeleteSubtask(sub.id)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="font-semibold">Комментарии:</span>
          <ul className="mt-2 space-y-2">
            {sidebarTask.comments.length === 0 && (
              <li className="text-gray-400">Нет комментариев</li>
            )}
            {sidebarTask.comments.map((c) => (
              <li key={c.id} className="border-b pb-2">
                <div className="text-xs text-gray-500 mb-1">
                  {returnDate(c.created_at)}
                </div>
                <div>{c.content}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body
  );
}
