import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { CSS } from "@dnd-kit/utilities";
import {
  useSortable,
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { IColumn, ITask, IFullTask } from "@/interfaces/Board";
import SortableTask from "./SortableTask";
import { createTask, deleteColumn, updateColumn } from "@/pages/api/board";
import DropdownMenu from "../DropdownMenu";
import { SlOptions } from "react-icons/sl";
import TaskSidebar from "./TaskSidebar";

type Props = {
  column: IColumn;
  updateBoard: () => void;
};

function SortableColumn({ column, updateBoard }: Props) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(column.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sidebarTask, setSidebarTask] = useState<IFullTask | null>(null);

  // Фокус на инпут при начале редактирования
  useEffect(() => {
    if (editing) {
      setInputValue(column.title);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing, column.title]);

  const handleTitleClick = () => {
    setEditing(true);
  };

  const finishEdit = async () => {
    setEditing(false);
    if (inputValue.trim() !== "" && inputValue !== column.title) {
      await updateColumn(column.id, "title", inputValue);
      updateBoard();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      finishEdit();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  };

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

  async function handleAddTask() {
    const title = prompt("Введите название задачи");
    if (!title) return;
    const position = column.tasks.length + 1;
    await createTask(column.id, title, position).then().catch(console.error);
    updateBoard();
  }

  async function handleDeleteColumn(colID: string) {
    await deleteColumn(colID).then().catch(console.error);
    updateBoard();
  }

  const renderTask = useCallback(
    (task: ITask) => (
      <SortableTask key={task.id} task={task} openSidebar={setSidebarTask} />
    ),
    []
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex flex-col min-w-[260px] w-2xs max-w-xs min-h-full rounded-lg bg-sky-400 shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] z-10"
    >
      <div className="relative flex items-center justify-center">
        <div
          {...attributes}
          className={`sticky top-0 z-10 flex items-center justify-center w-full p-2 text-2xl leading-8 font-black rounded-t-[6px] bg-sky-600 shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } min-h-12`}
          {...(!editing ? listeners : {})}
        ></div>
        <div className="absolute top-0 z-10 flex items-center justify-center m-2 text-2xl leading-8 font-black rounded-t-[6px] bg-transparent">
          {editing ? (
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={finishEdit}
              onKeyDown={handleInputKeyDown}
              className="bg-white text-sky-900 rounded px-2 py-1 text-xl font-bold outline-none"
              style={{ minWidth: 0 }}
            />
          ) : (
            <span
              onClick={
                handleTitleClick}
              className="cursor-pointer select-none text-center max-w-[210px] truncate block"
              title={column.title}
            >
              {column.title}
            </span>
          )}
        </div>
        <DropdownMenu
          handleClass="absolute right-4 top-3 z-10"
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
              label: "Фильтровать пиво",
              submenu: [
                { label: "Светлое", onClick: () => alert("Опция 1") },
                { label: "Темное", onClick: () => alert("Опция 2") },
                {
                  label: "Нефильтрованное",
                  onClick: () => alert("Опция сосал"),
                },
              ],
            },
          ]}
        />
      </div>
      <div className="-z-1 flex-1 flex flex-col items-center gap-2 w-full p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-700">
        {column.tasks.length === 0 ? (
          <div className="flex items-center justify-center w-full h-20 text-2xl leading-8 font-semibold text-white uppercase">
            List is empty
          </div>
        ) : (
          <SortableContext
            items={column.tasks}
            strategy={verticalListSortingStrategy}
          >
            {column.tasks.map(renderTask)}
          </SortableContext>
        )}
      </div>
      <div className="flex justify-center py-4 z-20 bg-gradient-to-t from-sky-400 via-sky-400/80 to-transparent">
        <button
          onClick={handleAddTask}
          className="flex items-center justify-center h-12 w-12 sm:h-12 sm:w-auto sm:px-4 sm:py-2 rounded-full sm:rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-600 hover:text-sky-800 transition shadow border-2 border-dashed border-sky-300 cursor-pointer"
          title="Добавить задачу"
          style={{ minWidth: "48px" }}
        >
          <FaPlus className="text-2xl sm:text-xl" />
          <span className="hidden sm:inline font-semibold text-base ml-2">
            Добавить задачу
          </span>
        </button>
      </div>
      <TaskSidebar task={sidebarTask} onClose={() => setSidebarTask(null)} onBoardUpdate={updateBoard}/>
    </div>
  );
}

export default React.memo(SortableColumn);
