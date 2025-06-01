import React from "react";
import { FaPlus } from "react-icons/fa";
import { CSS } from "@dnd-kit/utilities";
import { useSortable, verticalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { IColumn } from "@/interfaces/Board";
import SortableTask from "./SortableTask";
import { createTask } from "@/pages/api/board";

type Props = {
  column: IColumn;
  updateBoard: () => void;
};

function SortableColumn({ column, updateBoard }: Props) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex flex-col min-w-[260px] w-2xs max-w-xs min-h-full rounded-lg bg-sky-400 shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] z-10"
    >
      <div
        {...listeners}
        {...attributes}
        className={`sticky top-0 z-10 flex items-center justify-center w-full p-2 text-2xl leading-8 font-black rounded-t-[6px] bg-sky-600 shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {column.title}
      </div>
      <div className="flex-1 flex flex-col items-center gap-2 w-full p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-700">
        {column.tasks.length === 0 ? (
          <div className="flex items-center justify-center w-full h-20 text-2xl leading-8 font-semibold text-white uppercase">
            List is empty
          </div>
        ) : (
          <SortableContext
            items={column.tasks}
            strategy={verticalListSortingStrategy}
          >
            {column.tasks.map((task) => (
              <SortableTask key={task.id} task={task} />
            ))}
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
    </div>
  );
}

export default React.memo(SortableColumn);