import React from "react";
import { MdOutlineDownloadDone } from "react-icons/md";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IFullTask, ITask, Status } from "@/interfaces/Board";
import { GrInProgress } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { getTask } from "@/pages/api/board";
import { PRIORITY_FLAG } from "@/constants/priorityFlag";
import Image from "next/image";
import { LiaComment } from "react-icons/lia";
import returnDate from "@/helpers/NormalDate";

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

  const date = returnDate(task.due_date)
  const [day, month] = [date.split('.')[0], date.split('.')[1]]
  const abstractMonth: Record<string, string> = {
    "01": "янв.",
    "02": "фев.",
    "03": "мар.",
    "04": "апр.",
    "05": "май",
    "06": "июн.",
    "07": "июл.",
    "08": "авг.",
    "09": "сен.",
    "10": "окт.",
    "11": "нояб.",
    "12": "дек.",
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
    backgroundColor: task.color ?? "#fff",
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
          <span className="text-gray-500">{day} {abstractMonth[month]}</span>
          <span className="-mt-1 text-base">{task.title}</span>
        </div>
        <div className="flex flex-row justify-between mt-2">
          <div className="flex flex-row">
            {task.responsibles.map((user, index) => (
              <div
                key={user.id}
                className="relative"
                style={{
                  marginLeft: index > 0 ? "-8px" : "0",
                  zIndex: task.responsibles.length + index,
                }}
              >
                <Image
                  src={user.avatar_url ?? ""}
                  alt={user.username}
                  width={100}
                  height={100}
                  className="w-6 h-6 rounded-[6px] object-cover border border-white"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-row gap-2">
            <span>{task.total_comments > 0 ? <LiaComment className="text-xl text-gray-500" /> : <></>}</span>
            <span>{PRIORITY_FLAG[task.priority]}</span>
          </div>
        </div>
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
