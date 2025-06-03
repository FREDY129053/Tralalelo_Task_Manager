import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IFullTask } from "@/interfaces/Board";
import { IoMdClose } from "react-icons/io";

type Props = {
  task: IFullTask | null;
  onClose: () => void;
};

export default function TaskSidebar({ task, onClose }: Props) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне панели
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    if (task) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [task, onClose]);
  console.log(task)
  if (!task) return null;

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
        <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
        <div className="mb-2 text-gray-500 text-sm">
          <span className="mr-4">ID: {task.id}</span>
          <span>Позиция: {task.position}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Приоритет: </span>
          <span>{task.priority}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Статус: </span>
          <span>{task.status}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Ответственный: </span>
          <span>{task.responsible_id ?? "—"}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Цвет: </span>
          <span>
            {task.color ? (
              <span
                className="inline-block w-4 h-4 rounded-full align-middle"
                style={{ background: task.color }}
              />
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Подзадачи: </span>
          <span>
            {task.completed_subtasks} / {task.total_subtasks}
          </span>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Список подзадач:</span>
          <ul className="list-disc ml-6">
            {task.subtasks.map((sub) => (
              <li key={sub.id} className={sub.is_completed ? "line-through text-gray-400" : ""}>
                {sub.title}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="font-semibold">Комментарии:</span>
          <ul className="mt-2 space-y-2">
            {task.comments.length === 0 && <li className="text-gray-400">Нет комментариев</li>}
            {task.comments.map((c) => (
              <li key={c.id} className="border-b pb-2">
                <div className="text-xs text-gray-500 mb-1">{c.created_at}</div>
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