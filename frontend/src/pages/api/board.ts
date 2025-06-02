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
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`${errorMsg}: ${res.statusText}`);
  }

  if (options?.method !== "DELETE" && options?.method !== "PATCH") {
    return res.json();
  }

  return undefined as T;
}

export async function getBoards(): Promise<IBoardShortInfo[]> {
  return apiFetch<IBoardShortInfo[]>(
    "http://localhost:8080/api/boards",
    { method: "GET", headers: { Accept: "application/json" } },
    "ошибка при получении досок"
  );
}

export async function getBoardData(boardId: string): Promise<IBoardFullInfo> {
  return apiFetch<IBoardFullInfo>(
    `http://localhost:8080/api/boards/${boardId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
    "Ошибка при получении доски"
  );
}

export async function updateColumnsPositions(
  colsInfo: IUpdateCols[]
): Promise<void> {
  return apiFetch(
    "http://localhost:8080/api/columns/update_positions",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(colsInfo),
    },
    "Ошибка при обновлении позиций колонок"
  );
}

export async function updateTaskData(tasksData: IUpdateTasks[]): Promise<void> {
  return apiFetch(
    "http://localhost:8080/api/tasks/positions",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(tasksData),
    },
    "Ошибка при обновлении задачи"
  );
}

export async function createColumn(
  boardUUID: string,
  title: string,
  position: number,
  color: string | null = null
): Promise<void> {
  return apiFetch(
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
    },
    "Ошибка при создании колонки"
  );
}

export async function deleteColumn(columnUUID: string): Promise<void> {
  return apiFetch(
    `http://localhost:8080/api/columns/${columnUUID}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
    "Ошибка при удалении колонки"
  );
}

export async function updateColumn(
  columnUUID: string,
  field: string,
  value: string
): Promise<void> {
  return apiFetch(
    `http://localhost:8080/api/columns/${columnUUID}/info`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ [field]: value }),
    },
    "Ошибка при обновлении колонки"
  );
}

export async function createTask(
  columnUUID: string,
  title: string,
  position: number
): Promise<void> {
  return apiFetch(
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
    },
    "Ошибка при создании задачи"
  );
}

export async function getBoardColumns(boardId: string): Promise<IColumn[]> {
  return apiFetch<IColumn[]>(
    `http://localhost:8080/api/boards/${boardId}/columns`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
    "Ошибка при получении колонок"
  );
}
