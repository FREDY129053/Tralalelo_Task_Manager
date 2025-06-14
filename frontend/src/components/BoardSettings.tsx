import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SelectColor from "./ColorPicker";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import { IoMdClose } from "react-icons/io";

type Props = {
  board: {
    id: string;
    title: string;
    description: string | null;
    color?: string | null;
    is_public: boolean;
  };
  onClose: () => void;
  updateBoard: (id: string, field: string, value: string | boolean) => Promise<void>;
};

export default function BoardSettings({ board, onClose, updateBoard }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const {
    editing: editingTitle,
    value: valueTitle,
    setValue: setTitleValue,
    inputRef: inputTitleRef,
    startEditing: startTitleEditing,
    finishEditing: finishTitleEditing,
    handleKeyDown: handleTitleKeyDown,
  } = useInlineEdit({
    initialValue: board.title,
    onSave: async (newValue) => {
      await updateBoard(board.id, "title", newValue);
    },
  });

  const {
    editing: editingDesc,
    value: valueDesc,
    setValue: setDescValue,
    inputRef: inputDescRef,
    startEditing: startDescEditing,
    finishEditing: finishDescEditing,
    handleKeyDown: handleDescKeyDown,
  } = useInlineEdit({
    initialValue: board.description ?? "",
    onSave: async (newValue) => {
      await updateBoard(board.id, "description", newValue);
    },
  });

  const handleColorChange = async (color: string) => {
    await updateBoard(board.id, "color", color);
    setColorPickerVisible(false);
  };

  const handlePrivacyChange = async (isPrivate: boolean) => {
    await updateBoard(board.id, "is_public", isPrivate);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      <div
        ref={boxRef}
        className="w-full max-w-lg relative bg-modal-bg border border-[var(--color-board-tint-5)] rounded-2xl shadow-2xl p-6"
      >
        <button
          className="cursor-pointer absolute right-4 top-4 text-3xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Закрыть"
          type="button"
        >
          <IoMdClose />
        </button>
        <h2 className="text-xl font-bold mb-6 text-text-primary text-center">
          Настройки доски
        </h2>

        <div className="mb-4">
          <label className="font-semibold block mb-1">Название доски:</label>
          {editingTitle ? (
            <input
              ref={inputTitleRef as React.RefObject<HTMLInputElement>}
              value={valueTitle}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={finishTitleEditing}
              onKeyDown={handleTitleKeyDown}
              className="bg-input-bg text-text-primary border border-input-border w-full rounded px-2 py-1 text-lg font-bold outline-none"
              style={{ minWidth: 0 }}
            />
          ) : (
            <span
              className="cursor-pointer block px-2 py-1 rounded hover:bg-gray-100"
              onClick={startTitleEditing}
              title={board.title}
            >
              {board.title}
            </span>
          )}
        </div>

        <div className="mb-4">
          <label className="font-semibold block mb-1">Описание:</label>
          {editingDesc ? (
            <textarea
              ref={inputDescRef as React.RefObject<HTMLTextAreaElement>}
              value={valueDesc}
              onChange={e => setDescValue(e.target.value)}
              onBlur={finishDescEditing}
              onKeyDown={handleDescKeyDown}
              className="bg-input-bg text-text-primary border border-input-border w-full rounded px-2 py-1 text-base outline-none"
              rows={3}
              style={{ minWidth: 0 }}
            />
          ) : (
            <span
              className="cursor-pointer block px-2 py-1 rounded hover:bg-gray-100 whitespace-pre-line"
              onClick={startDescEditing}
            >
              {board.description || "—"}
            </span>
          )}
        </div>

        <div className="mb-4">
          <label className="font-semibold block mb-1">Цвет доски:</label>
          <div className="flex items-center gap-4">
            <div
              className="w-8 h-8 rounded-full border border-gray-300"
              style={{ background: board.color || "#fff" }}
            />
            <button
              className="cursor-pointer px-3 py-1 bg-sky-100 rounded hover:bg-sky-200 text-sky-700"
              onClick={() => setColorPickerVisible(v => !v)}
              type="button"
            >
              Выбрать цвет
            </button>
          </div>
          {colorPickerVisible && (
            <div className="mt-2">
              <SelectColor
                color={board.color ?? ""}
                setPickerVisible={setColorPickerVisible}
                pickerVisible={colorPickerVisible}
                changeColor={handleColorChange}
              />
            </div>
          )}
        </div>

        {/* Открытость */}
        <div className="mb-2">
          <label className="font-semibold block mb-1">Открытость доски:</label>
          <div className="flex gap-4 items-center">
            <button
              className={`cursor-pointer px-3 py-1 rounded ${!board.is_public ? "bg-gray-300 text-gray-700" : "bg-sky-500 text-white"} font-semibold`}
              disabled={!board.is_public}
              onClick={() => handlePrivacyChange(false)}
              type="button"
            >
              Публичная
            </button>
            <button
              className={`cursor-pointer px-3 py-1 rounded ${!board.is_public? "bg-sky-500 text-white" : "bg-gray-300 text-gray-700"} font-semibold`}
              disabled={board.is_public}
              onClick={() => handlePrivacyChange(true)}
              type="button"
            >
              Приватная
            </button>
            <span className="ml-2 text-sm text-gray-500">
              {!board.is_public ? "Текущий режим: Приватная" : "Текущий режим: Публичная"}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}