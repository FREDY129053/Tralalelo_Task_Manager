import { IBoardShortInfo } from "@/interfaces/Board";
import { getBoards } from "@/pages/api/board";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Boards() {
  const [boards, setBoards] = useState<IBoardShortInfo[] | null>(null);
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");

  useEffect(() => {
    getBoards().then(setBoards).catch(console.error);
  }, []);

  const filteredBoards = boards?.filter((board) => {
    if (filter === "all") return true;
    if (filter === "public") return board.is_public;
    if (filter === "private") return !board.is_public;
    return true;
  }) ?? [];

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Мои доски</h1>

      {/* Фильтры */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {["all", "public", "private"].map((f) => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                ${
                  isActive
                    ? "bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)] border-[var(--color-button-primary-bg)]"
                    : "border-[var(--color-button-primary-bg)] text-[var(--color-button-primary-bg)] hover:bg-[var(--color-button-primary-bg)] hover:text-white"
                }`}
            >
              {f === "all" && "Все доски"}
              {f === "public" && "Публичные"}
              {f === "private" && "Приватные"}
            </button>
          );
        })}
      </div>

      {/* Список досок */}
      <div className={`${filteredBoards.length <= 0 ? "flex flex-col items-center justify-center" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}`}>
        {filteredBoards.length > 0 ? (
          filteredBoards.map((board) => (
            <Link
              href={`boards/${board.id}`}
              key={board.id}
              className="bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-xl shadow-md hover:shadow-lg border border-[var(--color-border)] p-5 relative transition"
            >
              {/* Цветная боковая граница */}
              <div
                className="absolute top-0 left-0 h-full w-2 rounded-l-xl"
                style={{ backgroundColor: board.color ?? "var(--color-button-primary-bg)" }}
              />

              <div className="pl-4">
                <h2 className="text-xl font-semibold">{board.title}</h2>
                {board.description && (
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2">{board.description}</p>
                )}
                <span
                  className={`inline-block mt-4 text-xs font-medium px-3 py-1 rounded-full ${
                    board.is_public
                      ? "bg-[var(--tag-color-green)] text-green-800"
                      : "bg-[var(--tag-color-pink)] text-pink-800"
                  }`}
                >
                  {board.is_public ? "Публичная" : "Приватная"}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center text-[var(--color-text-secondary)]">Загрузка...</div>
        )}
      </div>
    </div>
  );
}
