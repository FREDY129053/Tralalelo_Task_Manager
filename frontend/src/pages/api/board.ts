import { IBoardFullInfo, IBoardShortInfo, IColumn } from "@/interfaces/Board";

interface IUpdateCols {
  col_id: string;
  new_pos: number;
}

interface IUpdateTasks {
  col_id: string;
  task_id: string;
  position: number;
}

async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit,
  errorMsg?: string
): Promise<T> {
  const res = await fetch(url, options)

  if (!res.ok) {
    throw new Error(errorMsg || `Ошибка в запросе: ${res.statusText}`)
  }

  if (options?. method !== "DELETE" && options?.method !== "PATCH") {
    return res.json()
  }

  return undefined as T
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
    throw new Error(`Ошибка при получении доски: ${res.statusText}`);
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

export async function updateTaskData(tasksData: IUpdateTasks[]): Promise<void> {
  const res = await fetch(`http://localhost:8080/api/tasks/positions`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(tasksData),
  });

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

export async function deleteColumn(columnUUID: string): Promise<void> {
  const res = await fetch(`http://localhost:8080/api/columns/${columnUUID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Ошибка при удалении колонки: ${res.statusText}`);
  }
}

export async function updateColumn(
  columnUUID: string,
  field: string,
  value: string
): Promise<void> {
  const res = await fetch(
    `http://localhost:8080/api/columns/${columnUUID}/info`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ [field]: value }),
    }
  );

  if (!res.ok) {
    throw new Error(`Ошибка при обновлении колонки: ${res.statusText}`);
  }
}

export async function createTask(
  columnUUID: string,
  title: string,
  position: number
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

export async function getBoardColumns(boardId: string): Promise<IColumn[]> {
  const res = await fetch(
    `http://localhost:8080/api/boards/${boardId}/columns`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Ошибка при получении колонок: ${res.statusText}`);
  }

  const columns: IColumn[] = await res.json();
  return columns;
}
