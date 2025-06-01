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
  const [activeItem, setActiveItem] = useState<DraggedTask | DraggedColumn | null>(null);
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

  const updateBoard = () => getBoardData(uuid!).then(setBoardData).catch(console.error);

  if (!boardData) return <div>Loading...</div>;

  async function handleAddColumn() {
    const title = prompt("Введите название колонки");
    if (!title) return;
    const position = boardData!.columns.length + 1;
    await createColumn(uuid!, title, position).then().catch(console.error);
    updateBoard();
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

      const colsData = newColumns.map((col, index) => ({
        col_id: col.id,
        new_pos: index,
      }));

      updateColumnsPositions(colsData);
      return;
    }

    let targetColumnId: string | undefined;
    if (boardData!.columns.some((col) => col.id === overId)) {
      targetColumnId = overId;
    } else {
      targetColumnId = findColumnByTaskId(overId);
    }
    if (!targetColumnId) return;

    const targetColumn = boardData!.columns.find(
      (col) => col.id === targetColumnId
    )!;
    let newIndex: number;

    if (targetColumn.id === overId || activeId === overId) {
      newIndex = targetColumn.tasks.length;
    } else {
      newIndex = targetColumn.tasks.findIndex((t) => t.id === overId);
      if (newIndex === -1) {
        newIndex = targetColumn.tasks.length;
      }
    }

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
            <SortableColumn key={col.id} column={col} updateBoard={updateBoard} />
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