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
  user: IUserShortInfo
}

export type Role = "CREATOR" | "MODERATOR" | "MEMBER"
export type Status = "TODO" | "IN_PROGRESS" | "DONE" | "REJECT"
export type Priority = "LOW" | "MEDIUM" | "HIGH"
export interface ITask {
  id: string
  title: string
  description: string | null
  position: number
  priority: Priority
  status: Status
  color: string | null
  responsibles: IUserShortInfo[]
  total_subtasks: number
  completed_subtasks: number
  subtasks: ISubtask[]
  total_comments: number
  due_date: string
}

export interface IFullTask extends ITask {
  comments: IComment[]
  due_date: string
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

export interface IUserShortInfo {
  id: string
  username: string
  avatar_url: string | null
}

export interface IMember extends IUserShortInfo {
  role: Role
}

export interface INotification {
  title: string
  text: string
  is_read: boolean
  created_at: string
  id: number
}