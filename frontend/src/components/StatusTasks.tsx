import React, { useRef, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaCheck, FaTimes } from "react-icons/fa";
import { PRIORITY_FLAG } from "@/constants/priorityFlag";
import { ITask } from "@/interfaces/Board";
import { createPortal } from "react-dom";

type Props = {
  tasks: ITask[];
  onClose: () => void;
  onChangeStatus: (taskId: string) => void;
  title?: string;
};

export default function TasksModal({ tasks, onClose, onChangeStatus, title }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      <div
        ref={modalRef}
        className="w-full max-w-2xl relative bg-white border rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]"
      >
        <button
          className="cursor-pointer absolute right-4 top-4 text-3xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Закрыть"
          type="button"
        >
          <IoMdClose />
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">{title || "Список задач"}</h2>
        <div className="overflow-y-auto flex-1 pr-2">
          {tasks.length === 0 ? (
            <div className="text-center text-gray-400 py-10">Нет задач</div>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-3 shadow-sm"
                >
                  {/* Чекбокс со статусом */}
                  <button
                    className={`
                      cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-2
                      ${
                        task.status === "DONE"
                          ? "border-green-500 bg-green-100 text-green-600"
                          : task.status === "REJECT"
                          ? "border-red-500 bg-red-100 text-red-600"
                          : "border-gray-300 bg-white text-gray-400"
                      }
                      transition
                    `}
                    title="Сделать задачу активной"
                    disabled={task.status !== "DONE" && task.status !== "REJECT"}
                    onClick={() => onChangeStatus(task.id)}
                  >
                    {task.status === "DONE" && <FaCheck className="text-lg" />}
                    {task.status === "REJECT" && <FaTimes className="text-lg" />}
                  </button>
                  {/* Название и инфо */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{task.title}</span>
                      <span>{PRIORITY_FLAG[task.priority]}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Без срока"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}