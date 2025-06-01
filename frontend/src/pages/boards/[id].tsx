import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { FaPlus } from "react-icons/fa";
import { IBoardFullInfo, IColumn, ITask } from "@/interfaces/Board";
import {
  createColumn,
  getBoardData,
  updateColumnsPositions,
  updateTaskData,
} from "../api/board";
import SortableColumn from "@/components/SoloBoard/SortableColumn";
import OverlayColumn from "@/components/SoloBoard/OverlayColumn";
import OverlayTask from "@/components/SoloBoard/OverlayTask";

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

  const updateBoard = () =>
    getBoardData(uuid!).then(setBoardData).catch(console.error);

  if (!boardData) return <div>Loading...</div>;

  async function handleAddColumn() {
    const title = prompt("Введите название колонки");
    if (!title) return;
    const position = boardData!.columns.length + 1;
    await createColumn(uuid!, title, position).then().catch(console.error);
    updateBoard();
  }

  function getTasksPositionsPayload(column: IColumn) {
    return column.tasks.map((task, idx) => ({
      col_id: column.id,
      task_id: task.id,
      position: idx + 1,
    }));
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
      return;
    }

    const allTasks = boardData!.columns.flatMap((col) => col.tasks);
    const task = allTasks.find((t) => t.id === activeId);
    if (task) {
      setActiveItem({ type: "task", task: { ...task } });
    }
  }

  function handleDragOver(event: DragOverEvent) {
  const { active, over } = event;
  if (!active || !over) return;

  const activeId = active.id as string;
  const overId   = over.id   as string;

  /* если перетаскиваем КОЛОНКУ – здесь ничего не делаем */
  if (boardData!.columns.some(c => c.id === activeId)) return;

  const sourceColId = findColumnByTaskId(activeId);
  const targetColId = boardData!.columns.some(c => c.id === overId)
    ? overId
    : findColumnByTaskId(overId);

  if (!sourceColId || !targetColId) return;

  const sourceCol = boardData!.columns.find(c => c.id === sourceColId)!;
  const targetCol = boardData!.columns.find(c => c.id === targetColId)!;

  const sourceIdx = sourceCol.tasks.findIndex(t => t.id === activeId);
  const overIdx   = targetCol.tasks.findIndex(t => t.id === overId);

  /* 👉 1. внутри одной колонки */
  if (sourceColId === targetColId) {
    const newTasks = arrayMove(
      sourceCol.tasks,
      sourceIdx,
      overIdx === -1 ? sourceCol.tasks.length - 1 : overIdx
    );

    const nextColumns = boardData!.columns.map(col =>
      col.id === sourceColId ? { ...col, tasks: newTasks } : col
    );
    setBoardData({ board: boardData!.board, columns: nextColumns });
    return;
  }

  /* 👉 2. между колонками */
  const task      = sourceCol.tasks[sourceIdx];
  const newSrc    = [...sourceCol.tasks];
  newSrc.splice(sourceIdx, 1);

  const insertAt  = overIdx === -1 ? targetCol.tasks.length : overIdx;
  const newTgt    = [...targetCol.tasks];
  newTgt.splice(insertAt, 0, task);

  const nextColumns = boardData!.columns.map(col => {
    if (col.id === sourceColId)  return { ...col, tasks: newSrc };
    if (col.id === targetColId)  return { ...col, tasks: newTgt };
    return col;
  });
  setBoardData({ board: boardData!.board, columns: nextColumns });
}

  function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!active || !over) return;

  const activeId = active.id as string;
  const overId   = over.id   as string;

  /* 1.  Перемещаем КОЛОНКИ -------------------------------- */
  const srcColIdx = boardData!.columns.findIndex(c => c.id === activeId);
  const dstColIdx = boardData!.columns.findIndex(c => c.id === overId);

  if (srcColIdx !== -1 && dstColIdx !== -1 && srcColIdx !== dstColIdx) {
    const newCols = arrayMove(boardData!.columns, srcColIdx, dstColIdx);
    setBoardData({ board: boardData!.board, columns: newCols });

    updateColumnsPositions(
      newCols.map((c,i) => ({ col_id: c.id, new_pos: i }))
    );
    setActiveItem(null);
    return;
  }

  /* 2.  Перемещаем ЗАДАЧИ -------------------------------- */
  const sourceColId = findColumnByTaskId(activeId)!;
  const targetColId = boardData!.columns.some(c => c.id === overId)
    ? overId
    : findColumnByTaskId(overId)!;

  if (!sourceColId || !targetColId) return;

  const sourceCol = boardData!.columns.find(c => c.id === sourceColId)!;
  const targetCol = boardData!.columns.find(c => c.id === targetColId)!;

  const srcIdx = sourceCol.tasks.findIndex(t => t.id === activeId);
  const overIdx = targetCol.tasks.findIndex(t => t.id === overId);
  const insertIdx = overIdx === -1 ? targetCol.tasks.length : overIdx;

  let nextColumns;
  if (sourceColId === targetColId) {
    /* внутри одной колонки */
    const newTasks = arrayMove(sourceCol.tasks, srcIdx, insertIdx);
    nextColumns = boardData!.columns.map(c =>
      c.id === sourceColId ? { ...c, tasks: newTasks } : c
    );
  } else {
    /* между колонками */
    const task = sourceCol.tasks[srcIdx];
    const newSrc = [...sourceCol.tasks];
    newSrc.splice(srcIdx, 1);

    const newTgt = [...targetCol.tasks];
    newTgt.splice(insertIdx, 0, task);

    nextColumns = boardData!.columns.map(c => {
      if (c.id === sourceColId) return { ...c, tasks: newSrc };
      if (c.id === targetColId) return { ...c, tasks: newTgt };
      return c;
    });
  }

  setBoardData({ board: boardData!.board, columns: nextColumns });

  /* обновляем позиции только тех колонок, где изменился порядок */
  [sourceColId, targetColId].forEach(id => {
    const col = nextColumns.find(c => c.id === id)!;
    updateTaskData(getTasksPositionsPayload(col));
  });

  setActiveItem(null);
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
        items={boardData.columns.map(col => col.id)}
        // items={boardData.columns}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex flex-nowrap h-full justify-start w-auto gap-6 p-6 overflow-x-auto relative">
          {boardData.columns.map((col) => (
            <SortableColumn
              key={col.id}
              column={col}
              updateBoard={updateBoard}
            />
          ))}
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
