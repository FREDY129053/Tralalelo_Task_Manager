import { IBoardFullInfo, IBoardShortInfo } from "@/interfaces/Board";

export async function getBoards(): Promise<IBoardShortInfo[]> {
  const res = await fetch(`http://localhost:8080/api/boards`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Ошибка при получении досок: ${res.statusText}`);
  }

  const boards: IBoardShortInfo[] = await res.json();
  return boards;
}

export async function getBoardData(boardId: string): Promise<IBoardFullInfo> {
  const res = await fetch(`http://localhost:8080/api/boards/${boardId}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Ошибка при получении пользователя: ${res.statusText}`);
  }

  const board: IBoardFullInfo = await res.json();
  return board;
}
