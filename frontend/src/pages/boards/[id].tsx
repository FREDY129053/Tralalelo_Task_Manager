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
import { FaPlus } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { MdDragIndicator } from "react-icons/md";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { IBoardFullInfo, IColumn, ITask } from "@/interfaces/Board";
import {
  createColumn,
  getBoardData,
  updateColumnsPositions,
  updateTaskData,
} from "../api/board";
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

  async function handleAddColumn() {
    const title = prompt("Введите название колонки");
    if (!title) return;
    const position = boardData!.columns.length + 1;

    createColumn(uuid!, title, position).then().catch(console.error);
    getBoardData(uuid!).then(setBoardData).catch(console.error);
  }

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

    // Проверяем: если оба id — это колонки, значит dnd колонок
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
      // DnD колонок
      const newColumns = arrayMove(
        boardData!.columns,
        activeColIndex,
        overColIndex
      );
      setBoardData({ board: boardData!.board, columns: newColumns });

      const colsData = newColumns.map((col, index) => ({
        col_id: col.id,
        new_pos: index,
      }));

      updateColumnsPositions(colsData);
      return;
    }

    // DnD задачи (activeId — задача)
    // Определяем колонку, куда перенесли задачу
    let targetColumnId: string | undefined;
    if (boardData!.columns.some((col) => col.id === overId)) {
      targetColumnId = overId;
    } else {
      targetColumnId = findColumnByTaskId(overId);
    }
    if (!targetColumnId) return;

    // Определяем позицию задачи в новой колонке
    const targetColumn = boardData!.columns.find(
      (col) => col.id === targetColumnId
    )!;
    let newIndex = targetColumn.tasks.findIndex((t) => t.id === overId);
    if (newIndex === -1) {
      newIndex = targetColumn.tasks.length;
    }

    // Проверяем, что activeId действительно задача (а не колонка)
    const isTask = boardData!.columns.some((col) =>
      col.tasks.some((t) => t.id === activeId)
    );
    if (isTask) {
      updateTaskData(activeId, targetColumnId, newIndex);
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
        <div className="flex flex-nowrap h-full justify-start w-auto gap-6 p-6 overflow-x-auto relative">
          {boardData.columns.map((col) => (
            <SortableColumn key={col.id} column={col} />
          ))}
          {/* Кнопка "Добавить колонку" — маленькая, рядом с последней колонкой */}
          <div className="flex items-center">
            <button
              onClick={handleAddColumn}
              className="flex items-center justify-center h-12 w-12 sm:h-12 sm:w-auto sm:px-4 sm:py-2 rounded-full sm:rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-600 hover:text-sky-800 transition shadow border-2 border-dashed border-sky-300 cursor-pointer"
              title="Добавить колонку"
              style={{ minWidth: "48px" }}
            >
              <FaPlus className="text-2xl sm:text-xl" />
              <span className="hidden sm:inline font-semibold text-base ml-2">
                Добавить колонку
              </span>
            </button>
          </div>
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
      className="flex flex-col gap-2 w-2xs min-h-full min-w-64 rounded-lg bg-sky-400 shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] z-10"
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
