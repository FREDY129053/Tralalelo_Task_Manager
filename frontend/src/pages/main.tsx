import Boards from "@/components/Boards";
import { FilterOption, IBoardShortInfo } from "@/interfaces/Board";
import { useEffect, useState } from "react";
import { getBoards, createBoard, deleteBoard } from "./api/board";
import { IoMdAdd } from "react-icons/io";
import { useRouter } from "next/router";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Main() {
  useAuthRedirect()
  const [boards, setBoards] = useState<IBoardShortInfo[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const router = useRouter();
  const isMobile = useIsMobile(480)

  useEffect(() => {
    if (!router) return;
    getBoards().then(setBoards).catch(console.error);
  }, [router]);

  const myBoardsFilters: FilterOption[] = [
    {
      label: "Все доски",
      value: "all",
      field: "",
      check: () => true,
    },
    {
      label: "Публичные",
      value: "public",
      field: "is_public",
      check: (board) => board.is_public,
    },
    {
      label: "Приватные",
      value: "private",
      field: "is_public",
      check: (board) => !board.is_public,
    },
  ];

  const handleCreate = async () => {
    if (!title.trim()) return;
    const answer = await createBoard(title, description || null, isPublic);
    router.push(`/boards/${answer.message}`);
  };
  const handleDeleteBoard = async (boardID: string) => {
    await deleteBoard(boardID);
    getBoards().then(setBoards).catch(console.error)
  }

  return (
    <div className="relative">
      <Boards title="Мои доски" boards={boards} filters={myBoardsFilters} onDeleteBoard={handleDeleteBoard} />
      <button
        className="cursor-pointer fixed flex items-center gap-2 right-8 bottom-8 z-50 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition"
        onClick={() => setModalOpen(true)}
      >
        <IoMdAdd className="w-6 h-6" />
        {!isMobile && "Создать доску"}
      </button>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="cursor-pointer absolute right-4 top-4 text-2xl text-gray-400 hover:text-gray-700"
              onClick={() => setModalOpen(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-6 text-center">
              Создать доску
            </h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Название</label>
              <input
                type="text"
                placeholder="Минимум 2 символа"
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-sky-500"
                value={title}
                minLength={2}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label className="block mb-1 font-medium">Описание</label>
              <textarea
                placeholder="Необязательно"
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-sky-500 min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
              />
            </div>
            <div className="mb-6 flex items-center gap-3">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic((v) => !v)}
                  className="accent-sky-600 w-5 h-5 mr-2"
                />
                {isPublic ? (
                  <>
                    <FaLockOpen className="text-sky-600 mr-1" />
                    <span className="text-sky-700 font-medium">Публичная</span>
                  </>
                ) : (
                  <>
                    <FaLock className="text-gray-500 mr-1" />
                    <span className="text-gray-700 font-medium">Приватная</span>
                  </>
                )}
              </label>
            </div>
            <button
              className="cursor-pointer w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded-lg transition"
              onClick={handleCreate}
              disabled={!title.trim()}
            >
              Создать
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
