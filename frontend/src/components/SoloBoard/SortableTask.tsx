import React from "react";
import { MdDragIndicator, MdOutlineDownloadDone } from "react-icons/md";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IFullTask, ITask, Priority, Status } from "@/interfaces/Board";
import { FaFlag } from "react-icons/fa6";
import { GrInProgress } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { getTask } from "@/pages/api/board";

type Props = {
  task: ITask;
  openSidebar: (task: IFullTask) => void;
};

function SortableTask({ task, openSidebar }: Props) {
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

  const priorityFlags: Record<Priority, React.ReactNode> = {
    LOW: <span className="text-gray-600"><FaFlag /></span>,
    MEDIUM: <span className="text-blue-600"><FaFlag /></span>,
    HIGH: <span className="text-red-600"><FaFlag /></span>,
  };

  const statusIcon: Record<Status, React.ReactNode> = {
    TODO : <></>,
    IN_PROGRESS: <><GrInProgress /></>,
    DONE: <><MdOutlineDownloadDone /></>,
    REJECT: <><IoMdClose /></>
  }

  const openFullTask = (taskID: string) => {
    getTask(taskID).then(openSidebar).catch(console.error);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex w-full text-2xl leading-8 items-center rounded-lg p-3 z-10 gap-2 font-black cursor-pointer"
      onClick={() => openFullTask(task.id)}
    >
      <MdDragIndicator
        className={`h-6 w-6 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } text-sky-300 focus:outline-2 focus:outline-transparent focus:outline-offset-2`}
        {...listeners}
        {...attributes}
      />
      <div className="flex flex-col gap-4">
        <span>{task.title}</span>
        <div className="flex gap-2">
          <span>{priorityFlags[task.priority]}</span>
        <span>{statusIcon[task.status]}</span>
        </div>
        <span>{task.completed_subtasks} / {task.total_subtasks}</span>
      </div>
    </div>
  );
}

export default React.memo(SortableTask);
