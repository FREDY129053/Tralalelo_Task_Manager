import React from "react";
import { MdDragIndicator } from "react-icons/md";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ITask } from "@/interfaces/Board";

type Props = {
  task: ITask;
};

function SortableTask({ task }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task" },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
    backgroundColor: task.color ?? "#fff",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex w-full h-16 text-2xl leading-8 items-center rounded-lg p-3 z-10 gap-2 font-black"
    >
      <MdDragIndicator
        className={`h-6 w-6 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } text-sky-300 focus:outline-2 focus:outline-transparent focus:outline-offset-2`}
        {...listeners}
        {...attributes}
      />
      <span>{task?.title}</span>
    </div>
  );
}

export default React.memo(SortableTask);
