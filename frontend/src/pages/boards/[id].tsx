import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { produce } from "immer";
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
import { FaFolderOpen, FaPlus } from "react-icons/fa";
import {
  IBoardFullInfo,
  IColumn,
  IMember,
  ITask,
  Role,
} from "@/interfaces/Board";
import {
  addMember,
  changeRole,
  createColumn,
  deleteMember,
  getBoardData,
  getBoardMembers,
  updateColumnsPositions,
  updateTaskData,
} from "../api/board";
import SortableColumn from "@/components/SoloBoard/SortableColumn";
import OverlayColumn from "@/components/SoloBoard/OverlayColumn";
import OverlayTask from "@/components/SoloBoard/OverlayTask";
import { IoPersonAdd } from "react-icons/io5";
import BoardUsers from "@/components/BoardUsers";
import { IoMdSettings } from "react-icons/io";

type DraggedTask = { type: "task"; task: ITask };
type DraggedColumn = { type: "column"; column: IColumn };

export default function BoardPage() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [boardData, setBoardData] = useState<IBoardFullInfo | null>(null);
  const [activeItem, setActiveItem] = useState<
    DraggedTask | DraggedColumn | null
  >(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [members, setMembers] = useState<IMember[]>([]);

  useEffect(() => {
    if (router.isReady) {
      setUuid(router.query.id as string);
    }
  }, [router]);

  useEffect(() => {
    if (!uuid) return;
    getBoardData(uuid).then(setBoardData).catch(console.error);
    getBoardMembers(uuid).then(setMembers).catch(console.error)
  }, [uuid]);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumnByTaskId = useCallback(
    (taskId: string): string | undefined => {
      return boardData!.columns.find((col) =>
        col.tasks.some((t) => t.id === taskId)
      )?.id;
    },
    [boardData]
  );

  const updateBoard = useCallback(() => {
    getBoardData(uuid!).then(setBoardData).catch(console.error);
    getBoardMembers(uuid!).then(setMembers).catch(console.error);
  }, [uuid]);

  const getMembers = useCallback(() => {
    getBoardMembers(uuid!).then(setMembers).catch(console.error);
  }, [uuid]);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!active || !over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (boardData!.columns.some((c) => c.id === activeId)) return;

      const sourceColId = findColumnByTaskId(activeId);
      const targetColId = boardData!.columns.some((c) => c.id === overId)
        ? overId
        : findColumnByTaskId(overId);

      if (!sourceColId || !targetColId) return;

      const sourceIdx = boardData!.columns
        .find((c) => c.id === sourceColId)!
        .tasks.findIndex((t) => t.id === activeId);
      const overIdx = boardData!.columns
        .find((c) => c.id === targetColId)!
        .tasks.findIndex((t) => t.id === overId);

      const insertAt =
        overIdx === -1
          ? boardData!.columns.find((c) => c.id === targetColId)!.tasks.length
          : overIdx;

      // Если таска уже в нужной позиции, не делаем ничего
      if (sourceColId === targetColId && sourceIdx === insertAt) return;

      const next = produce(boardData!, (draft) => {
        const sourceCol = draft.columns.find((c) => c.id === sourceColId)!;
        const targetCol = draft.columns.find((c) => c.id === targetColId)!;

        const [movedTask] = sourceCol.tasks.splice(sourceIdx, 1);
        targetCol.tasks.splice(insertAt, 0, movedTask);
      });

      setBoardData(next);
    },
    [boardData, findColumnByTaskId]
  );

  async function handleAddColumn() {
    const title = prompt("Введите название колонки");
    if (!title) return;
    const position = boardData!.columns.length + 1;
    await createColumn(uuid!, title, position).then().catch(console.error);
    updateBoard();
  }

  async function handleAddMember(userID: string) {
    await addMember(uuid!, userID).then().catch(console.error);
    getMembers();
  }
  async function handleChangeMemberRole(userID: string, role: Role) {
    await changeRole(uuid!, userID, role).then().catch(console.error);
    getMembers();
  }
  async function handleDeleteMember(userID: string) {
    await deleteMember(uuid!, userID).then().catch(console.error);
    getMembers();
  }

  function getTasksPositionsPayload(column: IColumn) {
    return column.tasks.map((task, idx) => ({
      col_id: column.id,
      task_id: task.id,
      position: idx + 1,
    }));
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Перемещение колонок
    const srcColIdx = boardData!.columns.findIndex((c) => c.id === activeId);
    const dstColIdx = boardData!.columns.findIndex((c) => c.id === overId);

    if (srcColIdx !== -1 && dstColIdx !== -1 && srcColIdx !== dstColIdx) {
      const newCols = arrayMove(boardData!.columns, srcColIdx, dstColIdx);

      setBoardData((prev) => ({
        ...prev!,
        columns: newCols,
      }));

      updateColumnsPositions(
        newCols.map((c, i) => ({ col_id: c.id, new_pos: i }))
      );

      setActiveItem(null);
      return;
    }

    const sourceColId = findColumnByTaskId(activeId)!;
    const targetColId = boardData!.columns.some((c) => c.id === overId)
      ? overId
      : findColumnByTaskId(overId)!;

    if (!sourceColId || !targetColId) return;

    const next = produce(boardData!, (draft) => {
      const sourceCol = draft.columns.find((c) => c.id === sourceColId)!;
      const targetCol = draft.columns.find((c) => c.id === targetColId)!;

      const srcIdx = sourceCol.tasks.findIndex((t) => t.id === activeId);
      const overIdx = targetCol.tasks.findIndex((t) => t.id === overId);
      const insertIdx = overIdx === -1 ? targetCol.tasks.length : overIdx;

      // если таска не переместилась — ничего не делаем
      if (sourceColId === targetColId && srcIdx === insertIdx) return;

      const [movedTask] = sourceCol.tasks.splice(srcIdx, 1);
      targetCol.tasks.splice(insertIdx, 0, movedTask);
    });

    setBoardData(next);

    // Обновляем бэкенд только по затронутым колонкам
    const affectedColIds = new Set([sourceColId, targetColId]);
    for (const colId of affectedColIds) {
      const col = next.columns.find((c) => c.id === colId)!;
      updateTaskData(getTasksPositionsPayload(col));
    }

    setActiveItem(null);
  }

  if (!boardData) return <div>Loading...</div>;

  return (
    <>
      <div className="mt-4 px-6 flex items-center flex-row justify-between mb-6">
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-row text-base items-center gap-2 font-bold">
            <FaFolderOpen className="w-8 h-8" />
            {boardData.board.title}
          </div>
          <span className="truncate block max-w-2xl">
            {boardData.board.description}
          </span>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <button
            className="flex gap-2 items-center cursor-pointer p-[7px] rounded-[6px] border-none transition h-[30px] text-sm font-[500] hover:text-[#1A1A1A] hover:bg-[#E9E9E9]"
            onClick={() => {
              setIsOpen(true);
              getMembers();
            }}
          >
            <IoPersonAdd className="w-6 h-6" /> Пригласить
          </button>
          {isOpen && (
            <BoardUsers
              onClose={() => setIsOpen(false)}
              members={members}
              addMembers={handleAddMember}
              deleteMember={handleDeleteMember}
              changeRole={handleChangeMemberRole}
            />
          )}
          <button className="flex font-[500] cursor-pointer h-[30px] items-center p-[7px] rounded-[6px] hover:text-[#1A1A1A] hover:bg-[#E9E9E9]">
            <IoMdSettings className="w-6 h-6"/>
          </button>
        </div>
      </div>
      <DndContext
        collisionDetection={closestCorners}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
      >
        <SortableContext
          items={boardData.columns.map((col) => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-nowrap h-[90%] justify-start w-auto gap-6 p-6 overflow-x-auto relative">
            {boardData.columns.map((col) => (
              <SortableColumn
                key={col.id}
                column={col}
                members={members}
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
    </>
  );
}
