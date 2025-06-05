import { IMember, IUserShortInfo, Role } from "@/interfaces/Board";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  members: IMember[];
  addMembers: (userID: string) => void;
  deleteMember: (userID: string) => void;
  changeRole: (userID: string, role: Role) => void;
  onClose: () => void;
};

export default function BoardUsers({ onClose, members, addMembers, deleteMember, changeRole }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IUserShortInfo[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        onClose();
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

  const handleChangeRole = (userID: string, role: Role) => {
    if (role === "MEMBER") {
      changeRole(userID, "MODERATOR")
    } else if (role === "MODERATOR") {
      changeRole(userID, "MEMBER")
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        ref={boxRef}
        className="w-full max-w-md relative bg-white border border-gray-300 rounded shadow-lg p-4"
      >
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Введите запрос..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {showResults && (
          <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded shadow">
            {results.length === 0 ? (
              <div className="px-4 py-2">Нет результатов</div>
            ) : (
              results.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-4"
                >
                  <span className="w-50 whitespace-nowrap overflow-hidden overflow-ellipsis">{item.avatar_url}</span>
                  <span>{item.username}</span>
                  <button className="px-2 py-1 bg-sky-400 cursor-pointer" onClick={() => {addMembers(item.id); setQuery("")}}>
                    ADD
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {members.length !== 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center gap-3">
            {members.map((member) => (
            <div key={member.id} className="flex gap-2">
              <span>{member.username}</span>
              <span className="font-bold cursor-pointer" onClick={() => handleChangeRole(member.id, member.role)}>{member.role}</span>
              <button className="px-2 py-1 bg-red-500 cursor-pointer" onClick={() => deleteMember(member.id)}>DELETE</button>
            </div>
          ))}
          </div>
        ) : (
          <div>Участников нет, но вы можете добавить!</div>
        )}
      </div>
    </div>,
    document.body
  );
}
