import React from "react";
import { MdOutlineDownloadDone } from "react-icons/md";
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
    LOW: <></>,
    MEDIUM: (
      <span className="text-xl text-blue-600">
        <FaFlag />
      </span>
    ),
    HIGH: (
      <span className="text-xl text-red-600">
        <FaFlag />
      </span>
    ),
  };

  const statusIcon: Record<Status, React.ReactNode> = {
    TODO: <></>,
    IN_PROGRESS: (
      <>
        <GrInProgress />
      </>
    ),
    DONE: (
      <>
        <MdOutlineDownloadDone />
      </>
    ),
    REJECT: (
      <>
        <IoMdClose />
      </>
    ),
  };

  const openFullTask = (taskID: string) => {
    getTask(taskID).then(openSidebar).catch(console.error);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-[#111012]/10 w-full text-sm leading-8 items-center rounded-lg p-3 z-10 cursor-pointer"
      onClick={() => openFullTask(task.id)}
      {...listeners}
      {...attributes}
    >
      <div className="flex flex-col">
        <div className="flex flex-col">
          <span>12 июня</span>
          <span className="-mt-2 text-base">{task.title}</span>
        </div>
        <div className="flex flex-row justify-between">
          <span>{priorityFlags[task.priority]}</span>
          <span>{priorityFlags[task.priority]}</span>
        </div>
        {/* <span>{statusIcon[task.status]}</span> */}
        {/* <div>

          <span>
            {task.completed_subtasks} / {task.total_subtasks}
          </span>
        </div> */}
        <div className="flex items-center gap-2 mt-5">
          {task.total_subtasks > 0 &&
            (task.total_subtasks < 21 ? (
              <div className="flex flex-1 gap-[2px]">
                {Array.from({ length: task.total_subtasks }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-sm flex-1 min-w-[4px] ${idx < task.completed_subtasks ? "bg-green-500" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 h-2 bg-gray-300 rounded overflow-hidden">
                <div
                  className="h-2 bg-green-500 rounded"
                  style={{
                    width: `${Math.round((task.completed_subtasks / task.total_subtasks) * 100)}%`,
                  }}
                />
              </div>
            ))}
            {task.total_subtasks > 0 && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {task.completed_subtasks} / {task.total_subtasks}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(SortableTask);
