import React from "react";
import { MdDragIndicator } from "react-icons/md";
import { IColumn } from "@/interfaces/Board";

export default function OverlayColumn({ column }: { column: IColumn }) {
  return (
    <div className="flex flex-col gap-2 w-2xs min-h-full rounded-lg bg-sky-400 shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] z-10">
      <div className="flex items-center justify-center w-full p-2 text-2xl leading-8 font-black rounded-t-[6px] bg-sky-600 shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] cursor-grabbing">
        {column.title}
      </div>
      <div className="flex flex-col items-center gap-2 w-full p-4 max-h-[400px] overflow-y-auto">
        {column.tasks.length === 0 ? (
          <div className="flex items-center justify-center w-full h-20 text-2xl leading-8 font-semibold text-white uppercase">
            List is empty
          </div>
        ) : (
          column.tasks.map((task) => (
            <div
              key={task.id}
              className="flex w-full h-16 text-2xl leading-8 items-center rounded-lg bg-sky-600 p-3 z-10 gap-2 font-black opacity-70"
            >
              <MdDragIndicator className="h-6 w-6 text-sky-300" />
              <span>{task.title}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}