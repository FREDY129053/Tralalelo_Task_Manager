import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  title?: string;
  placeholder?: string;
};

export default function AddTaskModal({
  open,
  onClose,
  onSubmit,
  title = "Добавить задачу",
  placeholder = "Введите название задачи",
}: Props) {
  const [value, setValue] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setValue("");
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      <div
        ref={boxRef}
        className="w-full max-w-md relative bg-modal-bg border border-[var(--color-board-tint-5)] rounded-2xl shadow-2xl p-6"
      >
        <button
          className="cursor-pointer absolute right-4 top-4 text-3xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Закрыть"
          type="button"
        >
          <IoMdClose />
        </button>
        <h2 className="text-xl font-bold mb-6 text-text-primary text-center">{title}</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (value.trim()) {
              onSubmit(value.trim());
              setValue("");
            }
          }}
        >
          <input
            type="text"
            className="w-full px-4 py-2 mb-4 border border-input-border rounded focus:outline-none focus:ring-2 focus:ring-input-border"
            placeholder={placeholder}
            value={value}
            onChange={e => setValue(e.target.value)}
            autoFocus
            maxLength={100}
          />
          <button
            type="submit"
            className="cursor-pointer w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded-lg transition"
            disabled={!value.trim()}
          >
            Добавить
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}