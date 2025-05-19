import { IBoardShortInfo } from "@/interfaces/Board";
import { getBoards } from "@/pages/api/board";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Boards() {
  const [boards, setBoards] = useState<IBoardShortInfo[] | null>(null);

  useEffect(() => {
    getBoards().then(setBoards).catch(console.error);
  }, []);

  return (
    <div className="m-6 grid grid-cols-2 gap-6 items-center justify-center">
      {boards ? (
        boards.map((board, index) => (
          <Link
            href={`boards/${board.id}`}
            key={index}
            className="border border-amber-400 rounded-lg"
          >
            <p className="text-xl text-center">{board.title}</p>
            <p className="p-4">{board.description}</p>
          </Link>
        ))
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
