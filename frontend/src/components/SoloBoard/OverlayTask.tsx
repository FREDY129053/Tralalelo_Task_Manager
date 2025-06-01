import React from "react";
import { MdDragIndicator } from "react-icons/md";
import { ITask } from "@/interfaces/Board";

export default function OverlayTask({ task }: { task: ITask }) {
  return (
    <div className="flex w-full h-16 text-2xl leading-8 items-center rounded-lg bg-sky-600 p-3 z-10 gap-2 font-black">
      <MdDragIndicator className="h-6 w-6 cursor-grabbing text-sky-300 focus:outline-2 focus:outline-transparent focus:outline-offset-2" />
      <span>{task?.title}</span>
    </div>
  );
}