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
    const overId = over.id as string;

    const activeColumnId = findColumnByTaskId(activeId);
    const overColumnId = boardData!.columns.find((col) => col.id === overId)
      ? overId
      : findColumnByTaskId(overId);

    if (!activeColumnId || !overColumnId) return;

    const activeColumn = boardData!.columns.find(
      (col) => col.id === activeColumnId
    );
    const overColumn = boardData!.columns.find(
      (col) => col.id === overColumnId
    );

    if (!activeColumn || !overColumn) return;

    const activeTaskIndex = activeColumn.tasks.findIndex(
      (t) => t.id === activeId
    );
    const overTaskIndex = overColumn.tasks.findIndex((t) => t.id === overId);

    if (activeTaskIndex === -1) return;

    const newIndex =
      overTaskIndex >= 0 ? overTaskIndex : overColumn.tasks.length;

    const alreadyInPlace =
      activeColumnId === overColumnId && activeTaskIndex === newIndex;

    if (alreadyInPlace) return;

    const taskToMove = activeColumn.tasks[activeTaskIndex];
    if (!taskToMove) return;

    const nextColumns = boardData!.columns.map((col) => {
      if (col.id === activeColumnId) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== activeId),
        };
      }

      if (col.id === overColumnId) {
        const newTasks = [...col.tasks];
        newTasks.splice(newIndex, 0, taskToMove);
        return {
          ...col,
          tasks: newTasks,
        };
      }

      return col;
    });

    const sameStructure =
      JSON.stringify(boardData!.columns) === JSON.stringify(nextColumns);
    if (!sameStructure) {
      setBoardData({ board: boardData!.board, columns: nextColumns });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColIndex = boardData!.columns.findIndex(
      (col) => col.id === activeId
    );
    const overColIndex = boardData!.columns.findIndex(
      (col) => col.id === overId
    );

    const isActiveColumn = activeColIndex !== -1;
    const isOverColumn = overColIndex !== -1;

    if (isActiveColumn && isOverColumn && activeColIndex !== overColIndex) {
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

    const sourceColId = findColumnByTaskId(activeId)!;
    const targetColId = boardData!.columns.some((c) => c.id === overId)
      ? overId
      : findColumnByTaskId(overId)!;

    const sourceCol = boardData?.columns.find((c) => c.id === sourceColId);
    if (!sourceCol) return;
    const targetCol = boardData?.columns.find((c) => c.id === targetColId);
    if (!targetCol) return;

    const sourceIndex = sourceCol.tasks.findIndex((t) => t.id === activeId);
    const overIndex = targetCol.tasks.findIndex((t) => t.id === overId);

    const insertIndex = overIndex === -1 ? targetCol.tasks.length : overIndex;

    const movedTask = sourceCol.tasks[sourceIndex];

    const newColumns = boardData!.columns.map((col) => {
      /* Перенос внутри колонки */
      if (col.id === sourceCol.id && col.id === targetCol.id) {
        return {
          ...col,
          tasks: arrayMove(col.tasks, sourceIndex, insertIndex),
        };
      }

      /* Перенос между колонками */
      if (col.id === sourceCol.id) {
        const t = [...col.tasks];
        t.splice(sourceIndex, 1);
        return { ...col, tasks: t };
      }
      if (col.id === targetCol.id) {
        const t = [...col.tasks];
        t.splice(insertIndex, 0, movedTask);
        return { ...col, tasks: t };
      }
      return col;
    });

    setBoardData({ board: boardData!.board, columns: newColumns });

    [sourceColId, targetColId].forEach((id) => {
      const col = newColumns.find((c) => c.id === id)!;
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
