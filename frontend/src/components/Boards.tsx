import { useIsMobile } from "@/hooks/useIsMobile";
import {
  FilterOption,
  IBoardShortInfo,
  IMemberBoardShortInfo,
} from "@/interfaces/Board";
import Link from "next/link";
import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";

type Props = {
  title: string;
  boards: IBoardShortInfo[] | IMemberBoardShortInfo[] | null;
  filters?: FilterOption[];
  defaultFilter?: string;
  onDeleteBoard?: (id: string) => void;
};

export default function Boards({
  title,
  boards,
  filters,
  defaultFilter = "all",
  onDeleteBoard,
}: Props) {
  const [filter, setFilter] = useState<string>(defaultFilter);

  const filteredBoards =
    boards?.filter((board) => {
      const current = filters?.find((f) => f.value === filter);
      return current ? current.check(board) : true;
    }) ?? [];

  // Проверка на мобильное устройство
  const isMobile = useIsMobile(480);

  return (
    <div className="h-screen bg-main-bg text-[var(--color-text-primary)] p-8 overflow-y-scroll">
      <h1 className="text-3xl font-bold mb-6 text-center">{title}</h1>

      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {filters?.map((f) => {
          const isActive = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition hover:bg-hover cursor-pointer
            ${
              isActive
                ? "bg-[var(--color-button-bg)] text-[var(--color-text-inverted)] border-[var(--color-button-bg)]"
                : "border-[var(--color-button-bg)] text-[var(--color-button-bg)] hover:bg-[var(--color-button-bg)] hover:text-white"
            }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div
        className={`${
          filteredBoards.length <= 0
            ? "flex flex-col items-center justify-center"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        }`}
      >
        {filteredBoards.length > 0 ? (
          filteredBoards.map((board) => (
            <div key={board.id} className="relative group">
              <Link
                href={`boards/${board.id}`}
                className="bg-[var(--color-board-bg)] transition-all text-[var(--color-text-primary)] rounded-xl shadow-sm hover:shadow-md hover:scale-102 border border-[var(--color-border)] p-5 relative block"
              >
                <div
                  className="absolute top-0 left-0 h-full w-2 rounded-l-xl"
                  style={{
                    backgroundColor: board.color ?? "#fff",
                  }}
                />

                <div className="pl-4 pr-8">
                  <h2 className="text-xl font-semibold">{board.title}</h2>
                  {board.description && (
                    <p
                      className="text-sm text-[var(--color-text-secondary)] mt-2 overflow-hidden whitespace-pre-line"
                      style={{
                        maxHeight: "4.5em",
                        maxWidth: "250px",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {board.description.length > 200
                        ? board.description.slice(0, 200) + "..."
                        : board.description}
                    </p>
                  )}
                  <span
                    className={`inline-block mt-4 text-xs font-medium px-3 py-1 rounded-full ${
                      board.is_public
                        ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)]"
                        : "bg-[var(--color-error-bg)] text-[var(--color-error-text)]"
                    }`}
                  >
                    {board.is_public ? "Публичная" : "Приватная"}
                  </span>
                </div>
              </Link>
              {onDeleteBoard && (
                <button
                  className={`
                    absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow-md
                    text-red-500 hover:bg-red-100 hover:text-red-700 transition
                    ${isMobile ? "" : "opacity-0 group-hover:opacity-100"}
                  `}
                  style={{ pointerEvents: "auto" }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteBoard(board.id as string);
                  }}
                  title="Удалить доску"
                >
                  <FaTrashAlt className="w-5 h-5" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-[var(--color-text-secondary)]">
            Нет досок
          </div>
        )}
      </div>
    </div>
  );
}
