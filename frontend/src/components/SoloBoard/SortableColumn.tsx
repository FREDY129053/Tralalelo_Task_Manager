import React, { RefObject, useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { CSS } from "@dnd-kit/utilities";
import {
  useSortable,
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { IColumn, ITask, IFullTask, IMember } from "@/interfaces/Board";
import SortableTask from "./SortableTask";
import { createTask, deleteColumn, updateColumn } from "@/pages/api/board";
import DropdownMenu from "../DropdownMenu";
import { SlOptions } from "react-icons/sl";
import TaskSidebar from "./TaskSidebar";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import AddTaskModal from "../AddModal";

type Props = {
  column: IColumn;
  members: IMember[];
  updateBoard: () => void;
};

type PriorityFilter = "ALL" | "LOW" | "MEDIUM" | "HIGH";
type DueDateFilter = "ALL" | "WITH_DATE" | "WITHOUT_DATE";

const PRIORITY_LABELS: Record<PriorityFilter, string> = {
  ALL: "Все",
  LOW: "Низкий",
  MEDIUM: "Обычный",
  HIGH: "Высокий",
};
const DUE_LABELS: Record<DueDateFilter, string> = {
  ALL: "Все",
  WITH_DATE: "С датой",
  WITHOUT_DATE: "Без даты",
};

function SortableColumn({ column, updateBoard, members }: Props) {
  const [sidebarTask, setSidebarTask] = useState<IFullTask | null>(null);
  const columnColor = column.color;

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>("ALL");
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const {
    editing,
    value,
    setValue,
    inputRef,
    startEditing,
    finishEditing,
    handleKeyDown,
  } = useInlineEdit({
    initialValue: column.title,
    onSave: async (newValue) => {
      await updateColumn(column.id, "title", newValue);
      updateBoard();
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column" },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  };

  async function handleAddTask(title: string) {
    if (!title) return;
    const position = column.tasks.length + 1;
    await createTask(column.id, title, position).catch(console.error);
    updateBoard();
    setAddTaskOpen(false);
  }

  async function handleDeleteColumn(colID: string) {
    await deleteColumn(colID).then().catch(console.error);
    updateBoard();
  }

  const filteredTasks = column.tasks.filter((task) => {
    const priorityOk =
      priorityFilter === "ALL" ? true : task.priority === priorityFilter;
    const dueDateOk =
      dueDateFilter === "ALL"
        ? true
        : dueDateFilter === "WITH_DATE"
          ? !!task.due_date
          : !task.due_date;
    return priorityOk && dueDateOk;
  });

  const renderTask = useCallback(
    (task: ITask) => (
      <SortableTask key={task.id} task={task} openSidebar={setSidebarTask} />
    ),
    []
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: columnColor || undefined,
      }}
      className={`group rounded-b-[6px] relative border border-border flex flex-col flex-shrink-0 w-[260px] max-h-full rounded-lg shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] z-10 ${!column.color ? "bg-task-bg" : ""}`}
    >
      <div className="relative flex items-center justify-center">
        <div
          {...attributes}
          style={{
            background: columnColor || undefined,
          }}
          className={`sticky top-0 z-10 flex items-center justify-center w-full p-2 text-2xl leading-8 font-black rounded-t-[6px] ${!column.color ? "bg-task-bg" : ""}  ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } min-h-12`}
          {...(!editing ? listeners : {})}
        ></div>
        <div className="absolute max-w-3/4 left-4 top-0 z-10 flex items-center justify-center my-2 text-2xl leading-8 font-black rounded-t-[6px] bg-transparent">
          {editing ? (
            <input
              ref={inputRef as RefObject<HTMLInputElement>}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={finishEditing}
              onKeyDown={handleKeyDown}
              className="bg-input-bg text-text-primary border border-input-border rounded px-2 py-1 text-xl font-bold outline-none"
              style={{ minWidth: 0 }}
            />
          ) : (
            <span
              onClick={startEditing}
              className="cursor-pointer select-none text-center max-w-[210px] truncate block"
              title={column.title}
            >
              {column.title}
            </span>
          )}
        </div>
        <DropdownMenu
          handleClass="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute right-4 top-4 z-10"
          button={
            <div className="text-2xl">
              <SlOptions />
            </div>
          }
          options={[
            {
              label: "Удалить колонку",
              onClick: () => handleDeleteColumn(column.id),
            },
            {
              label: "Цвет колонки",
              colorPicker: true,
              color: column.color ?? "",
              onColorSelect: async (color) => {
                await updateColumn(column.id, "color", color);
                updateBoard();
              },
            },
            {
              label: `Фильтр по приоритету: ${PRIORITY_LABELS[priorityFilter]}`,
              submenu: [
                {
                  label: "Все",
                  onClick: () => setPriorityFilter("ALL"),
                },
                {
                  label: "Низкий",
                  onClick: () => setPriorityFilter("LOW"),
                },
                {
                  label: "Обычный",
                  onClick: () => setPriorityFilter("MEDIUM"),
                },
                {
                  label: "Высокий",
                  onClick: () => setPriorityFilter("HIGH"),
                },
              ],
            },
            {
              label: `Фильтр по сроку: ${DUE_LABELS[dueDateFilter]}`,
              submenu: [
                {
                  label: "Все",
                  onClick: () => setDueDateFilter("ALL"),
                },
                {
                  label: "С датой",
                  onClick: () => setDueDateFilter("WITH_DATE"),
                },
                {
                  label: "Без даты",
                  onClick: () => setDueDateFilter("WITHOUT_DATE"),
                },
              ],
            },
          ]}
        />
      </div>
      <div className="-z-1 flex-1 flex flex-col items-center gap-2 w-full p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-700">
        {filteredTasks.length === 0 ? (
          <div className="flex items-center justify-center w-full h-20 text-2xl leading-8 font-semibold text-white uppercase">
            
          </div>
        ) : (
          <SortableContext
            items={filteredTasks}
            strategy={verticalListSortingStrategy}
          >
            {filteredTasks.map(renderTask)}
          </SortableContext>
        )}
      </div>
      <div
        style={{
          background: columnColor || undefined,
        }}
        className={`flex justify-center rounded-b-[6px] py-4 z-20 ${!column.color ? "bg-task-bg" : ""}`}
      >
        <button
          onClick={() => setAddTaskOpen(true)}
          className={`
            flex items-center justify-center h-12 w-12 sm:h-12 sm:w-auto sm:px-4 sm:py-2
            rounded-full sm:rounded-lg bg-transparent hover:bg-column-bg text-sky-600 hover:text-sky-800 cursor-pointer
            transition-all duration-300
            ${addTaskOpen ? "opacity-100 pointer-events-auto" : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"}
          `}
          title="Добавить задачу"
          style={{ minWidth: "48px" }}
        >
          <FaPlus className="text-2xl sm:text-xl" />
          <span className="hidden sm:inline font-semibold text-base ml-2">
            Добавить задачу
          </span>
        </button>
      </div>
      <AddTaskModal
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        onSubmit={handleAddTask}
      />
      <TaskSidebar
        task={sidebarTask}
        members={members}
        onClose={() => setSidebarTask(null)}
        onBoardUpdate={updateBoard}
      />
    </div>
  );
}

export default React.memo(SortableColumn);
