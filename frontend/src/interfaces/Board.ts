export interface IBoardShortInfo {
  id: string
  title: string
  description: string | null
  is_public: boolean
  color: string | null
}

export interface ISubtask {
  id: string
  title: string
  is_completed: boolean
}

export interface IComment {
  id: string
  content: string
  created_at: string
  user_id: string
}

type Status = "TODO" | "IN_PROGRESS" | "DONE" | "REJECT"
type Priority = "LOW" | "MEDIUM" | "HIGH"
export interface ITask {
  id: string
  title: string
  description: string | null
  due_date: string | null
  priority: Priority
  status: Status
  color: string | null
  responsible_id: string | null
  subtasks: ISubtask[]
  comments: IComment[]
}

export interface IColumn {
  id: string
  title: string
  position: number
  color: string | null
  tasks: ITask[]
}

export interface IBoardFullInfo {
  board: IBoardShortInfo
  columns: IColumn[]
}