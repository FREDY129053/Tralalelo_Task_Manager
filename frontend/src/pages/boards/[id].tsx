import {
  DndContext,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  MouseSensor,
  closestCorners,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import React, { useEffect, useState } from "react";
import { MdDragIndicator } from "react-icons/md";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { IBoardFullInfo, IColumn, ITask } from "@/interfaces/Board";
import { getBoardData } from "../api/board";
import { useRouter } from "next/router";

type DraggedTask = { type: "task"; task: ITask };
type DraggedColumn = { type: "column"; column: IColumn };

export default function BoardPage() {
  const router = useRouter();
  const [boardData, setBoardData] = useState<IBoardFullInfo | null>(null);
  const [activeItem, setActiveItem] = useState<
    DraggedTask | DraggedColumn | null
  >(null);
  const [uuid, setUuid] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      setUuid(router.query.id as string);
    }
  }, [router]);

  useEffect(() => {
    if (!uuid) return;
    getBoardData(uuid).then(setBoardData).catch(console.error);
  }, [uuid]);

  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!boardData) return <div>Loading...</div>;

  function findColumnByTaskId(taskId: string): string | undefined {
    return boardData!.columns.find((col) =>
      col.tasks.some((t) => t.id === taskId)
    )?.id;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeId = active.id as string;
    const column = boardData!.columns.find((col) => col.id === activeId);
    if (column) {
      setActiveItem({ type: "column", column });
    } else {
      const task = boardData!.columns
        .flatMap((col) => col.tasks)
        .find((t) => t.id === activeId);
      if (task) setActiveItem({ type: "task", task });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!active || !over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumnId = findColumnByTaskId(activeId);
    const overColumnId = boardData!.columns.find((col) => col.id === overId)
      ? overId
      : findColumnByTaskId(overId);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId)
      return;

    const activeColumn = boardData!.columns.find(
      (col) => col.id === activeColumnId
    )!;
    const overColumn = boardData!.columns.find(
      (col) => col.id === overColumnId
    )!;

    const activeTaskIndex = activeColumn.tasks.findIndex(
      (t) => t.id === activeId
    );
    const overTaskIndex = overColumn.tasks.findIndex((t) => t.id === overId);

    const newIndex =
      overTaskIndex >= 0 ? overTaskIndex : overColumn.tasks.length;

    // Не обновлять, если задача уже на нужном месте
    if (activeColumnId === overColumnId && activeTaskIndex === newIndex) {
      return;
    }

    const nextColumns = boardData!.columns.map((col) => {
      if (col.id === activeColumnId) {
        return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) };
      }
      if (col.id === overColumnId) {
        const newTasks = [...col.tasks];
        newTasks.splice(newIndex, 0, activeColumn.tasks[activeTaskIndex]);
        return { ...col, tasks: newTasks };
      }
      return col;
    });

    setBoardData({ board: boardData!.board, columns: nextColumns });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    // Перемещение колонок
    const activeColIndex = boardData!.columns.findIndex(
      (col) => col.id === activeId
    );
    const overColIndex = boardData!.columns.findIndex(
      (col) => col.id === overId
    );

    if (
      activeColIndex !== -1 &&
      overColIndex !== -1 &&
      activeColIndex !== overColIndex
    ) {
      const newColumns = arrayMove(
        boardData!.columns,
        activeColIndex,
        overColIndex
      );
      setBoardData({ board: boardData!.board, columns: newColumns });
      console.log(newColumns)
      return;
    }

    // Перемещение задач внутри колонки
    const columnId = findColumnByTaskId(activeId);
    if (!columnId) return;
    const column = boardData!.columns.find((col) => col.id === columnId)!;
    const oldIndex = column.tasks.findIndex((t) => t.id === activeId);
    const newIndex = column.tasks.findIndex((t) => t.id === overId);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const newTasks = arrayMove(column.tasks, oldIndex, newIndex);
      const newColumns = boardData!.columns.map((col) =>
        col.id === columnId ? { ...col, tasks: newTasks } : col
      );
      console.log(activeId)
      setBoardData({ board: boardData!.board, columns: newColumns });
    }
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
    >
      <SortableContext
        items={boardData.columns}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex h-full justify-center w-screen gap-6 p-6 overflow-x-auto">
          {boardData.columns.map((col) => (
            <SortableColumn key={col.id} column={col} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          activeItem.type === "task" ? (
            <OverlayTask task={activeItem.task} />
          ) : (
            <OverlayColumn column={activeItem.column} />
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

type SortableColumnProps = {
  column: IColumn;
};

function SortableColumn({ column }: SortableColumnProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 w-2xs min-h-full rounded-lg bg-sky-400 shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] z-10"
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
      <div className="flex flex-col items-center gap-2 w-full p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-700 max-h-[400px]">
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
    </div>
  );
}

type SortableTaskProps = {
  task: ITask;
};

function SortableTask({ task }: SortableTaskProps) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex w-full h-16 text-2xl leading-8 items-center rounded-lg bg-sky-600 p-3 z-10 gap-2 font-black"
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

function OverlayColumn({ column }: { column: IColumn }) {
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

function OverlayTask({ task }: { task: ITask }) {
  return (
    <div className="flex w-full h-16 text-2xl leading-8 items-center rounded-lg bg-sky-600 p-3 z-10 gap-2 font-black">
      <MdDragIndicator className="h-6 w-6 cursor-grabbing text-sky-300 focus:outline-2 focus:outline-transparent focus:outline-offset-2" />
      <span>{task?.title}</span>
    </div>
  );
}
