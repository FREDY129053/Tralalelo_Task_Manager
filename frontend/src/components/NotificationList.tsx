import { INotification } from "@/interfaces/Board";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useIsMobile } from "@/hooks/useIsMobile";

type Props = {
  notifications: INotification[];
  onDelete: (id: number) => void;
  onRead: (id: number) => void;
};

export default function NotificationList({
  notifications,
  onDelete,
  onRead,
}: Props) {
  const [selected, setSelected] = useState<INotification | null>(null);
  const isMobile = useIsMobile(640);

  function NotificationModal({
    notification,
    onClose,
  }: {
    notification: INotification;
    onClose: () => void;
  }) {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback(() => {
      if (!notification.is_read) {
        onRead(notification.id);
      }
      onClose();
    }, [notification.id, notification.is_read, onClose]);

    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          handleClose();
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [handleClose]);

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
        <div
          ref={modalRef}
          className="w-full max-w-lg relative bg-white border rounded-2xl shadow-2xl p-6"
        >
          <button
            className="cursor-pointer absolute right-4 top-4 text-3xl text-gray-400 hover:text-gray-700"
            onClick={handleClose}
            aria-label="Закрыть"
            type="button"
          >
            <IoMdClose />
          </button>
          <h2 className="text-xl font-bold mb-4 text-text-primary text-center">
            {notification.title}
          </h2>
          <div className="prose prose-sky max-w-full break-words whitespace-pre-line text-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: (props) => (
                  <a
                    {...props}
                    className="text-sky-600 underline font-semibold break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            >
              {notification.text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  mx-auto flex flex-col h-full">
      <h2 className="text-3xl font-bold text-center pt-6 mb-6">Уведомления</h2>
      <div className="flex-1 w-full overflow-y-auto px-6 pb-2">
        {notifications.length === 0 && (
          <div className="text-center text-gray-400 py-10">Нет уведомлений</div>
        )}
        <ul>
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`
                group relative flex items-center justify-between gap-2 px-4 py-3 mb-2 rounded-lg cursor-pointer transition
                ${n.is_read ? "bg-gray-50 hover:bg-gray-100" : "bg-sky-50 border border-sky-200 shadow-sm"}
              `}
              onClick={() => setSelected(n)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{n.title}</div>
                <div className="text-gray-600 text-sm truncate">
                  {n.text.replace(/\n/g, " ").slice(0, 80)}
                  {n.text.length > 80 ? "..." : ""}
                </div>
              </div>
              <button
                className={`cursor-pointer ml-2 transition text-gray-400 hover:text-red-600
                  ${isMobile ? "" : "opacity-0 group-hover:opacity-100"}
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(n.id);
                }}
                title="Удалить"
              >
                <FaTrashAlt />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selected && (
        <NotificationModal
          notification={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
