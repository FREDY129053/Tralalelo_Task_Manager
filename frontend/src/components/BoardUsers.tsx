import { IUserShortInfo } from "@/interfaces/Board";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  onClose: () => void;
};

export default function BoardUsers({ onClose }: Props) {
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
                  <span>{item.avatar_url}</span>
                  <span>{item.username}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
