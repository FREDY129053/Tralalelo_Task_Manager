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
  IComment,
  IMember,
  ITask,
  Role,
} from "@/interfaces/Board";
import {
  addMember,
  changeRole,
  createColumn,
  deleteComment,
  deleteMember,
  getBoardComments,
  getBoardData,
  getBoardMembers,
  getBoardStatusTasks,
  updateBoardData,
  updateColumnsPositions,
  updateTask,
  updateTaskData,
  writeBoardComment,
} from "../api/board";
import SortableColumn from "@/components/SoloBoard/SortableColumn";
import OverlayColumn from "@/components/SoloBoard/OverlayColumn";
import OverlayTask from "@/components/SoloBoard/OverlayTask";
import { IoPersonAdd } from "react-icons/io5";
import BoardUsers from "@/components/BoardUsers";
import { IoMdSettings } from "react-icons/io";
import BoardSettings from "@/components/BoardSettings";
import { LiaComment } from "react-icons/lia";
import CommentsModal from "@/components/CommentsModal";
import { MdOutlineTask } from "react-icons/md";
import StatusTasks from "@/components/StatusTasks";
import { decodeJWT } from "@/helpers/DecodeToken.";
import { getRole } from "../api/users";
import { createNotification } from "../api/notification";
import AddTaskModal from "@/components/AddModal";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import Loading from "@/components/Loading";
import { useIsMobile } from "@/hooks/useIsMobile";

type DraggedTask = { type: "task"; task: ITask };
type DraggedColumn = { type: "column"; column: IColumn };

export default function BoardPage() {
  useAuthRedirect();
  const isMobile = useIsMobile(640); // или 640, если нужно строже
  const [isOpen, setIsOpen] = useState(false);
  const [isSetting, setIsSetting] = useState(false);
  const router = useRouter();
  const [boardData, setBoardData] = useState<IBoardFullInfo | null>(null);
  const [activeItem, setActiveItem] = useState<
    DraggedTask | DraggedColumn | null
  >(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [members, setMembers] = useState<IMember[]>([]);
  const [comments, setComments] = useState<IComment[]>([]);
  const [isComments, setIsComments] = useState(false);
  const [statusTasks, setStatusTasks] = useState<ITask[]>([]);
  const [isTasks, setIsTasks] = useState(false);
  const [userUUID, setUserUUID] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [addColumnOpen, setAddColumnOpen] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setUuid(router.query.id as string);
    }
  }, [router]);

  useEffect(() => {
    if (!uuid) return;

    const token = localStorage.getItem("token");
    if (!token) return;
    setUserUUID(decodeJWT(token));

    getRole(uuid)
      .then((res) => setUserRole(res.message))
      .catch(console.error);
    getBoardData(uuid).then(setBoardData).catch(console.error);
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

  const getComments = useCallback(() => {
    getBoardComments(uuid!).then(setComments).catch(console.error);
  }, [uuid]);

  const getBoard = useCallback(() => {
    getBoardData(uuid!).then(setBoardData).catch(console.error);
  }, [uuid]);

  const getStatusTasks = useCallback(() => {
    getBoardStatusTasks(uuid!).then(setStatusTasks).catch(console.error);
  }, [uuid]);

  const handleUpdateBoardData = useCallback(
    async (id: string, field: string, value: string | boolean) => {
      await updateBoardData(id, field, value);
      getBoard();
    },
    [getBoard]
  );

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

  async function handleAddColumn(title?: string) {
    if (!title) return;
    const position = boardData!.columns.length + 1;
    await createColumn(uuid!, title, position).catch(console.error);
    updateBoard();
    setAddColumnOpen(false);
  }

  async function handleAddMember(userID: string) {
    await addMember(uuid!, userID).then().catch(console.error);
    await createNotification(
      "Добавление в доску!",
      `Вас добавили в доску **"${boardData?.board.title}"**. Теперь вы часть семьи)\n\nСсылка: http://localhost:3000/boards/${boardData?.board.id}`,
      userID
    )
      .then()
      .catch(console.error);
    getMembers();
  }
  async function handleChangeMemberRole(userID: string, role: Role) {
    await changeRole(uuid!, userID, role).then().catch(console.error);
    await createNotification(
      "Изменение роли!",
      `Вы были назначены на роль ${role === "MODERATOR" ? "**МОДЕРАТОР**" : "**УЧАСТНИК**"} в доске **"${boardData?.board.title}"**.\n\nСсылка: http://localhost:3000/boards/${boardData?.board.id}`,
      userID
    )
      .then()
      .catch(console.error);
    getMembers();
  }

  async function handleDeleteMember(userID: string) {
    await deleteMember(uuid!, userID).then().catch(console.error);
    await createNotification(
      "Удаление из доски(",
      `Вы были удалены из доски **"${boardData?.board.title}"**...`,
      userID
    )
      .then()
      .catch(console.error);
    updateBoard();
  }

  async function handleWriteComment(text: string) {
    await writeBoardComment(uuid!, text);
    getComments();
  }
  async function handleDeleteComment(commentID: string) {
    await deleteComment(commentID);
    getComments();
  }

  async function handleChangeStatus(taskID: string) {
    await updateTask(taskID, "status", "TODO");
    updateBoard();
    getStatusTasks();
  }

  function getTasksPositionsPayload(column: IColumn) {
    return column.tasks.map((task, idx) => ({
      col_id: column.id,
      task_id: task.id,
      new_pos: idx + 1,
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

      if (sourceColId === targetColId && srcIdx === insertIdx) return;

      const [movedTask] = sourceCol.tasks.splice(srcIdx, 1);
      targetCol.tasks.splice(insertIdx, 0, movedTask);
    });

    setBoardData(next);

    const affectedColIds = new Set([sourceColId, targetColId]);
    for (const colId of affectedColIds) {
      const col = next.columns.find((c) => c.id === colId)!;
      updateTaskData(getTasksPositionsPayload(col));
    }

    setActiveItem(null);
  }

  if (!boardData)
    return (
      <div className="w-full h-full absolute translate-1/2">
        <Loading variant="dots" />
      </div>
    );

  const boardColor = boardData.board.color || "#fff";

  return (
    <div
      className="h-[98.9%]"
      style={{
        background: `linear-gradient(to bottom, #fff, ${boardColor})`,
      }}
    >
      <div
        className={`sticky pt-4 px-6 flex items-center justify-between mb-6 ${
          isMobile ? "flex-row gap-2 px-2 pt-2" : "flex-row"
        }`}
      >
        {!isMobile ? (
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-row text-base items-center gap-2 font-bold">
              <FaFolderOpen className="w-8 h-8" />
              {boardData.board.title}
            </div>
            <span className="truncate block max-w-2xl">
              {boardData.board.description}
            </span>
          </div>
        ) : null}
        <div
          className={`flex items-center gap-2 ${
            isMobile ? "w-full justify-end gap-6" : "gap-4"
          }`}
        >
          {userRole !== "MEMBER" && boardData.board.is_public && (
            <>
              <button
                className={`flex gap-2 items-center cursor-pointer p-[7px] rounded-[6px] border-none transition h-[30px] text-sm font-[500] hover:text-[#1A1A1A] hover:bg-[#E9E9E9] ${
                  isMobile ? "text-base px-2" : ""
                }`}
                onClick={() => {
                  setIsOpen(true);
                  getMembers();
                }}
                title="Пригласить"
              >
                <IoPersonAdd className="w-6 h-6" />
                {!isMobile && "Пригласить"}
              </button>
              {isOpen && (
                <BoardUsers
                  onClose={() => setIsOpen(false)}
                  members={members}
                  addMembers={handleAddMember}
                  deleteMember={handleDeleteMember}
                  changeRole={handleChangeMemberRole}
                  userID={userUUID!}
                />
              )}
            </>
          )}
          <button
            onClick={() => {
              getComments();
              setIsComments(true);
            }}
            className={`flex font-[500] cursor-pointer h-[30px] items-center p-[7px] rounded-[6px] hover:text-[#1A1A1A] hover:bg-[#E9E9E9] ${
              isMobile ? "text-base px-2" : ""
            }`}
            title="Комментарии"
          >
            <LiaComment className="w-6 h-6" />
          </button>
          {isComments && (
            <CommentsModal
              comments={comments}
              onClose={() => setIsComments(false)}
              canWrite={true}
              onSendComment={handleWriteComment}
              onDeleteComment={handleDeleteComment}
              userID={userUUID!}
              role={userRole!}
            />
          )}
          <button
            onClick={() => {
              getStatusTasks();
              setIsTasks(true);
            }}
            className={`flex font-[500] cursor-pointer h-[30px] items-center p-[7px] rounded-[6px] hover:text-[#1A1A1A] hover:bg-[#E9E9E9] ${
              isMobile ? "text-base px-2" : ""
            }`}
            title="Задачи по статусу"
          >
            <MdOutlineTask className="w-6 h-6" />
          </button>
          {isTasks && (
            <StatusTasks
              tasks={statusTasks}
              onClose={() => setIsTasks(false)}
              onChangeStatus={handleChangeStatus}
            />
          )}
          {userRole === "CREATOR" && (
            <>
              <button
                onClick={() => setIsSetting(true)}
                className={`flex font-[500] cursor-pointer h-[30px] items-center p-[7px] rounded-[6px] hover:text-[#1A1A1A] hover:bg-[#E9E9E9] ${
                  isMobile ? "text-base px-2" : ""
                }`}
                title="Настройки"
              >
                <IoMdSettings className="w-6 h-6" />
              </button>
              {isSetting && (
                <BoardSettings
                  board={boardData.board}
                  onClose={() => setIsSetting(false)}
                  updateBoard={handleUpdateBoardData}
                />
              )}
            </>
          )}
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
          <div className="flex flex-nowrap h-[90%] justify-start w-auto gap-6 p-6 relative overflow-x-scroll">
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
                onClick={() => setAddColumnOpen(true)}
                className="cursor-pointer flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition"
                title="Добавить колонку"
                style={{ minWidth: "48px" }}
              >
                <FaPlus className="text-2xl sm:text-xl" />
                <span className="hidden sm:inline font-semibold text-base ml-2">
                  Добавить колонку
                </span>
              </button>
              <AddTaskModal
                open={addColumnOpen}
                onClose={() => setAddColumnOpen(false)}
                onSubmit={handleAddColumn}
                title="Добавить колонку"
                placeholder="Введите название колонки"
              />
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
    </div>
  );
}
