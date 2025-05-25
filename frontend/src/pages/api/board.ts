import { IBoardFullInfo, IBoardShortInfo } from "@/interfaces/Board";

interface IUpdateCols {
  col_id: string;
  new_pos: number;
}

export async function getBoards(): Promise<IBoardShortInfo[]> {
  const res = await fetch(`http://localhost:8080/api/boards`, {
    method: "GET",
    headers: {
      Accept: "application/json",
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
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Ошибка при получении пользователя: ${res.statusText}`);
  }

  const board: IBoardFullInfo = await res.json();
  return board;
}

export async function updateColumnsPositions(
  colsInfo: IUpdateCols[]
): Promise<void> {
  const res = await fetch(
    `http://localhost:8080/api/columns/update_positions`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(colsInfo),
    }
  );

  if (!res.ok) {
    throw new Error(`Ошибка при обновлении позиций колонок: ${res.statusText}`);
  }
}

export async function updateTaskData(
  taskUUID: string,
  colUUID: string,
  position: number
): Promise<void> {
  const res = await fetch(
    `http://localhost:8080/api/tasks/${taskUUID}?col_id=${colUUID}&position=${position}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Ошибка при обновлении задачи: ${res.statusText}`);
  }
}

export async function createColumn(
  boardUUID: string,
  title: string,
  position: number,
  color: string | null = null
): Promise<void> {
  const res = await fetch(
    `http://localhost:8080/api/boards/${boardUUID}/columns`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title,
        position,
        color,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Ошибка при создании колонки: ${res.statusText}`);
  }
}

export async function createTask(
  columnUUID: string,
  title: string,
  position: number,
): Promise<void> {
  const res = await fetch(
    `http://localhost:8080/api/columns/${columnUUID}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title,
        position,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Ошибка при создании задачи: ${res.statusText}`);
  }
}
