import React from "react";
import { IColumn } from "@/interfaces/Board";
import OverlayTask from "./OverlayTask";

export default function OverlayColumn({ column }: { column: IColumn }) {
  const columnColor = column.color;

  return (
    <div
      style={{
        background: columnColor || undefined,
      }}
      className={`h-full group rounded-b-[6px] relative border border-border flex flex-col flex-shrink-0 w-[260px] max-h-full rounded-lg shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] z-10 ${!column.color ? "bg-task-bg" : ""}`}
    >
      <div className="relative flex items-center justify-center">
        <div
          style={{
            background: columnColor || undefined,
          }}
          className={`sticky top-0 z-10 flex items-center justify-center w-full p-2 text-2xl leading-8 font-black rounded-t-[6px] ${!column.color ? "bg-task-bg" : ""} cursor-grabbing min-h-12`}
        ></div>
        <div className="absolute max-w-3/4 left-4 top-0 z-10 flex items-center justify-center my-2 text-2xl leading-8 font-black rounded-t-[6px] bg-transparent">
          <span
            className="cursor-default select-none text-center max-w-[210px] truncate block"
            title={column.title}
          >
            {column.title}
          </span>
        </div>
      </div>
      <div className="-z-1 flex-1 flex flex-col items-center gap-2 w-full p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-700">
        {column.tasks.length === 0 ? (
          <div className="flex items-center justify-center w-full h-20 text-2xl leading-8 font-semibold text-white uppercase">
            
          </div>
        ) : (
          column.tasks.map((task) => (
            <OverlayTask key={task.id} task={task}/>
          ))
        )}
      </div>
      <div
        style={{
          background: columnColor || undefined,
        }}
        className={`flex justify-center rounded-b-[6px] py-4 z-20 ${!column.color ? "bg-task-bg" : ""}`}
      >
      </div>
    </div>
  );
}