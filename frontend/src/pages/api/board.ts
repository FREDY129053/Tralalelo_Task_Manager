import { IBoardFullInfo, IBoardShortInfo, IColumn, IFullTask, IMember, Role } from "@/interfaces/Board";
import { apiFetch } from "./abstractFunctions";

interface IUpdateCols {
  col_id: string;
  new_pos: number;
}

interface IUpdateTasks {
  col_id: string;
  task_id: string;
  position: number;
}

export async function getBoards(): Promise<IBoardShortInfo[]> {
  return apiFetch<IBoardShortInfo[]>(
    "http://localhost:8080/api/boards",
    { method: "GET" },
    "ошибка при получении досок"
  );
}

export async function getBoardData(boardId: string): Promise<IBoardFullInfo> {
  return apiFetch<IBoardFullInfo>(
    `http://localhost:8080/api/boards/${boardId}`,
    {
      method: "GET",
    },
    "Ошибка при получении доски"
  );
}

export async function getBoardMembers(boardID: string): Promise<IMember[]> {
  return apiFetch(
    `http://localhost:8080/api/boards/${boardID}/members`,
    {method: "GET"},
    "Ошибка при получении участников"
  )
}

export async function addMember(boardID: string, userID: string): Promise<void> {
  return apiFetch(
    `http://localhost:8080/api/boards/${boardID}/add_member?user_id=${userID}`,
    {method: "POST"},
    "Ошибка при добавлении участника"
  )
}

export async function changeRole(boardID: string, userID: string, role: Role) {
  return apiFetch(
    `http://localhost:8080/api/boards/${boardID}/change_role/${userID}?role=${role}`,
    {method: "PUT"},
    "Ошибка при обновлении роли"
  )
}

export async function deleteMember(boardID: string, userID: string): Promise<void> {
  return apiFetch(
    `http://localhost:8080/api/boards/${boardID}/delete_member?member_id=${userID}`,
    {method: "DELETE"},
    "Ошибка при удалении участника"
  )
}


export async function updateColumnsPositions(
  colsInfo: IUpdateCols[]
): Promise<void> {
  return apiFetch(
    "http://localhost:8080/api/columns/update_positions",
    {
      method: "PATCH",
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
    },
    "Ошибка при получении колонок"
  );
}

export async function getTask(taskID: string): Promise<IFullTask> {
  return apiFetch(
    `http://localhost:8080/api/tasks/${taskID}`,
    {
      method: "GET",
    },
    "Ошибка при получении задачи"
  )
}

export async function createSubTask(taskID: string, title: string, is_completed: boolean = false): Promise<void> {
  return apiFetch(
    `http://localhost:8080/api/tasks/${taskID}/subtasks`,
    {
      method: "POST",
      body: JSON.stringify({title, is_completed})
    },
    "Ошибка при получении задачи"
  )
}

export async function deleteSubTask(subtaskID: string): Promise<void> {
  return apiFetch(
    `http://localhost:8080/api/subtasks/${subtaskID}`,
    {
      method: "DELETE",
    },
    "Ошибка при удалении задачи"
  )
}

export async function updateTask(taskID: string, field: string, value: string | null): Promise<void> {
  return apiFetch(
    `http://localhost:8080/api/tasks/${taskID}/fields`,
    {
      method: "PATCH",
      body: JSON.stringify({[field]: value})
    },
    "Ошибка при удалении задачи"
  )
}
