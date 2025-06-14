import { IMember, IUserShortInfo, Role } from "@/interfaces/Board";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdMore } from "react-icons/io";

const rolePriority = { CREATOR: 0, MODERATOR: 1, MEMBER: 2 };

type Props = {
  members: IMember[];
  addMembers: (userID: string) => void;
  deleteMember: (userID: string) => void;
  changeRole: (userID: string, role: Role) => void;
  onClose: () => void;
  userID: string
};

export default function BoardUsers({
  onClose,
  members,
  addMembers,
  deleteMember,
  changeRole,
  userID,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IUserShortInfo[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        onClose();
      }
      if (!(e.target as HTMLElement).closest(".role-menu")) {
        setMenuOpenId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      fetch(
        `http://localhost:8080/api/users/search?query=${encodeURIComponent(query)}`
      )
        .then((res) => {
          if (!res.ok) throw new Error("Request failed");
          return res.json();
        })
        .then((data: IUserShortInfo[]) => {
          setResults(data);
          setShowResults(true);
        })
        .catch((err) => {
          console.error("Search error:", err);
          setShowResults(false);
        });
    }, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const sortedMembers = [...members].sort(
    (a, b) => rolePriority[a.role] - rolePriority[b.role]
  );

  const toggleRoleMenu = (id: string) => {
    setMenuOpenId((prev) => (prev === id ? null : id));
  };

  const handleChangeRole = (userID: string, role: Role) => {
    const newRole = role === "MODERATOR" ? "MEMBER" : "MODERATOR";
    changeRole(userID, newRole);
    setMenuOpenId(null);
  };

  const handleDelete = (userID: string) => {
    deleteMember(userID);
    setMenuOpenId(null);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      <div
        ref={boxRef}
        className="w-full max-w-2xl relative bg-modal-bg border border-[var(--color-board-tint-5)] rounded-2xl shadow-2xl p-6"
      >
        <h2 className="text-xl font-bold mb-2 text-text-primary">
          Добавить участников
        </h2>
        <input
          type="text"
          className="w-full px-4 py-2 mb-2 border border-input-border rounded focus:outline-none focus:ring-2 focus:ring-input-border"
          placeholder="Введите запрос..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {showResults && (
          <div className="absolute mt-1 w-[93%] z-100 bg-white border border-gray-300 rounded shadow">
            {results.length === 0 ? (
              <div className="px-4 py-2 text-center text-lg">
                Нет результатов
              </div>
            ) : (
              results.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-4 justify-between"
                >
                  <div className="flex flex-row gap-4 items-center">
                    <Image
                      className="object-fill rounded-[6px] border border-border"
                      src={item.avatar_url ?? ""}
                      alt={item.username}
                      width={30}
                      height={30}
                    />
                    <span>{item.username}</span>
                  </div>
                  <button
                    className="cursor-pointer px-2 py-1 bg-sky-400 text-white rounded"
                    onClick={() => {
                      addMembers(item.id);
                      setQuery("");
                    }}
                  >
                    Добавить
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <h2 className="text-xl font-bold mt-6 mb-3 text-text-primary">
          Текущие участники
        </h2>
        {sortedMembers.length !== 0 ? (
          <div className="flex flex-col gap-3">
            {sortedMembers.map((member) => (
              <div
                key={member.id}
                className="flex justify-between items-center border border-border bg-[var(--color-task-bg)] p-3 rounded shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Image
                    className="rounded-full border border-border"
                    src={member.avatar_url ?? ""}
                    alt={member.username}
                    width={40}
                    height={40}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold">{member.username}</span>
                    <span className="text-sm text-gray-600">
                      Роль: {member.role}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  {member.role === "CREATOR" || member.id === userID ? (
                    <></>
                  ) : (
                    <button
                      onClick={() => toggleRoleMenu(member.id)}
                      className="cursor-pointer p-2 hover:bg-gray-200 rounded-full"
                    >
                      <IoMdMore size={20} />
                    </button>
                  )}
                  {menuOpenId === member.id && (
                    <div className="role-menu absolute right-0 top-full mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-50">
                      {member.role === "MODERATOR" && (
                        <button
                          className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() =>
                            handleChangeRole(member.id, member.role)
                          }
                        >
                          Разжаловать модератора
                        </button>
                      )}
                      {member.role === "MEMBER" && (
                        <button
                          className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() =>
                            handleChangeRole(member.id, member.role)
                          }
                        >
                          Назначить модератором
                        </button>
                      )}
                      {member.role !== "CREATOR" && (
                        <button
                          className="cursor-pointer w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                          onClick={() => handleDelete(member.id)}
                        >
                          Удалить участника
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            Участников нет, но вы можете добавить!
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
