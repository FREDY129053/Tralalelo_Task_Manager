import React, { RefObject, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  IFullTask,
  IMember,
  ISubtask,
  Priority,
  Status,
} from "@/interfaces/Board";
import { IoMdClose } from "react-icons/io";
import {
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaTrashAlt,
} from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import {
  createSubTask,
  deleteResponsible,
  deleteSubTask,
  getTask,
  updateSubTask,
  updateTask,
  writeComment,
} from "@/pages/api/board";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Image from "next/image";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import { PRIORITY_FLAG } from "@/constants/priorityFlag";
import { CustomSelect } from "../CustomSelect";
import { motion } from "framer-motion";
import SelectColor from "../ColorPicker";
import WriteComment from "../Writecomment";
import CommentsList from "../CommentsList";

type Props = {
  task: IFullTask | null;
  onClose: () => void;
  members: IMember[];
  onBoardUpdate: () => void;
};

export default function TaskSidebar({
  task,
  onClose,
  members,
  onBoardUpdate,
}: Props) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarTask, setSidebarTask] = useState<IFullTask | null>(task);
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    setSidebarTask(task);
    setNewDueDate(task?.due_date ? new Date(task.due_date) : null);
  }, [task]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    if (sidebarTask) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarTask, onClose]);

  const {
    editing: editingTitle,
    value: valueTitle,
    setValue: setTitleValue,
    inputRef: inputTitleRef,
    startEditing: startTitleEditing,
    finishEditing: finishTitleEditing,
    handleKeyDown: handleTitleKeyDown,
  } = useInlineEdit({
    initialValue: sidebarTask?.title ?? "",
    onSave: async (newValue) => {
      if (!sidebarTask) return;
      await updateTask(sidebarTask.id, "title", newValue);
      updateEvent();
    },
  });

  const {
    editing: editingDescription,
    value: valueDescription,
    setValue: setDescriptionValue,
    inputRef: inputDescriptionRef,
    startEditing: startDescriptionEditing,
    finishEditing: finishDescriptionEditing,
    handleKeyDown: handleDescriptionKeyDown,
  } = useInlineEdit({
    initialValue: sidebarTask?.description ?? "",
    onSave: async (newValue) => {
      if (!sidebarTask) return;
      await updateTask(sidebarTask.id, "description", newValue);
      updateEvent();
    },
  });

  if (!sidebarTask) return null;

  const updateEvent = async () => {
    const updatedTask = await getTask(sidebarTask.id);
    setSidebarTask(updatedTask);
    onBoardUpdate();
  };

  const handleAddSubtask = async () => {
    const title = prompt("Введите название подзадачи");
    if (!title) return;
    await createSubTask(sidebarTask.id, title);
    await updateEvent();
  };

  const handleChangeSubtask = async (
    subtaskID: string,
    field: string,
    val: boolean | string
  ) => {
    await updateSubTask(subtaskID, field, val);
    updateEvent();
  };

  const handleDeleteSubtask = async (subtaskID: string) => {
    await deleteSubTask(subtaskID);
    await updateEvent();
  };

  const handleChangeStatus = async (statusVal: Status) => {
    await updateTask(sidebarTask.id, "status", statusVal);
    await updateEvent();
    onClose()
  };

  const handleChangePriority = async (priorityVal: Priority) => {
    await updateTask(sidebarTask.id, "priority", priorityVal);
    await updateEvent();
  };

  const handleAddResponsible = async (memberID: string) => {
    await updateTask(sidebarTask.id, "responsible", memberID);
    await updateEvent();
  };

  const handleDeleteResponsible = async (responsibleID: string) => {
    await deleteResponsible(sidebarTask.id, responsibleID);
    await updateEvent();
  };

  const handleColorChange = async (color: string) => {
    await updateTask(sidebarTask.id, "color", color);
    updateEvent();
  };

  const handleDueDateChange = async (date: Date | null) => {
    if (!date) {
      setNewDueDate(null);
      await updateTask(task!.id, "due_date", null);
      updateEvent()
      return;
    }
    const dateForAPI = date.toISOString();
    setNewDueDate(date);
    await updateTask(task!.id, "due_date", dateForAPI);
    updateEvent()
  };

  const handleWriteComment = async (content: string) => {
    await writeComment(sidebarTask.id, content)
    updateEvent()
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex justify-end pointer-events-none">
      <div
        ref={sidebarRef}
        className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col pointer-events-auto"
        style={{ zIndex: 100000 }}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Верхняя панель */}
            <UpPanel onClose={onClose} changeStatus={handleChangeStatus} />

            {/* Название */}
            <h2 className="text-2xl font-bold mb-2">
              {editingTitle ? (
                <input
                  ref={inputTitleRef as RefObject<HTMLInputElement>}
                  value={valueTitle}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={finishTitleEditing}
                  onKeyDown={handleTitleKeyDown}
                  className="bg-input-bg text-text-primary border border-input-border w-full rounded px-2 py-1 text-xl font-bold outline-none"
                  style={{ minWidth: 0 }}
                />
              ) : (
                <span className="cursor-pointer" onClick={startTitleEditing}>
                  {sidebarTask.title}
                </span>
              )}
            </h2>

            {/* Описание */}
            <div className="mb-4">
              <label className="font-semibold block mb-1">Описание:</label>
              {/* <p>{sidebarTask.description || "—"}</p> */}
              <p>
                {editingDescription ? (
                  <textarea
                    ref={inputDescriptionRef as RefObject<HTMLTextAreaElement>}
                    value={valueDescription}
                    onChange={(e) => setDescriptionValue(e.target.value)}
                    onBlur={finishDescriptionEditing}
                    onKeyDown={handleDescriptionKeyDown}
                    className="bg-input-bg text-text-primary w-full border border-input-border rounded px-2 py-1 text-xl font-bold outline-none"
                    style={{ minWidth: 0 }}
                    rows={3}
                  />
                ) : (
                  <span
                    className="cursor-pointer"
                    onClick={startDescriptionEditing}
                  >
                    {sidebarTask.description || "—"}
                  </span>
                )}
              </p>
            </div>

            {/* Приоритет */}
            <div className="mb-2">
              <SelectPriority
                task={sidebarTask}
                update={handleChangePriority}
              />
            </div>

            {/* Ответственные */}
            <div className="mb-2">
              <Responsibles
                task={sidebarTask}
                users={members}
                deleteResponsible={handleDeleteResponsible}
                onSelect={handleAddResponsible}
              />
            </div>

            {/* Срок */}
            <div className="mb-4">
              <SelectDate date={newDueDate} dateChange={handleDueDateChange} />
            </div>

            {/* Цвет */}
            <SelectColor
              color={sidebarTask.color}
              setPickerVisible={setColorPickerVisible}
              pickerVisible={colorPickerVisible}
              changeColor={handleColorChange}
            />

            {/* Прогресс подзадач */}
            <ProgressBar task={sidebarTask} />

            {/* Подзадачи */}
            <div className="mb-4">
              <SubtasksList
                showList={showSubtasks}
                setShowList={setShowSubtasks}
                task={sidebarTask}
                deleteSubtask={handleDeleteSubtask}
                addSubtask={handleAddSubtask}
                changeSubtask={handleChangeSubtask}
              />
            </div>

            {/* Комментарии */}
            <div className="mb-24">
              <CommentsList comments={sidebarTask.comments} />
            </div>
          </div>

          {/* Поле ввода комментария */}
          <WriteComment text={commentText} setComment={setCommentText} saveComment={handleWriteComment} />
        </div>
      </div>
    </div>,
    document.body
  );
}

function UpPanel({
  onClose,
  changeStatus,
}: {
  onClose: () => void;
  changeStatus: (status: Status) => void;
}) {
  return (
    <div className="flex justify-end gap-3 items-center mb-4">
      <div className="flex space-x-2">
        <button
          onClick={() => changeStatus("DONE")}
          className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium cursor-pointer hover:bg-green-200"
        >
          Завершено
        </button>
        <button
          onClick={() => changeStatus("REJECT")}
          className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium cursor-pointer hover:bg-red-200"
        >
          Отклонено
        </button>
        <div className="relative group items-center flex border border-border rounded-[6px] px-[3px]">
          <FiMoreVertical className="text-xl cursor-pointer" />
          <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white shadow-md rounded p-2 z-10">
            <button className="text-red-600 hover:underline text-sm">
              Удалить задачу
            </button>
          </div>
        </div>
      </div>
      <button
        className="text-3xl text-gray-400 hover:text-gray-700"
        onClick={onClose}
        aria-label="Закрыть"
        type="button"
      >
        <IoMdClose />
      </button>
    </div>
  );
}

function SelectPriority({
  task,
  update,
}: {
  task: IFullTask;
  update: (val: Priority) => void;
}) {
  const [priority, setPriority] = useState<Priority>(task.priority);

  const priorityOptions = [
    {
      value: "LOW",
      label: "Низкая",
      icon: PRIORITY_FLAG["LOW"],
    },
    {
      value: "MEDIUM",
      label: "Обычная",
      icon: PRIORITY_FLAG["MEDIUM"],
    },
    {
      value: "HIGH",
      label: "Высокая",
      icon: PRIORITY_FLAG["HIGH"],
    },
  ];

  const handlePriorityChange = (newPriority: Priority) => {
    setPriority(newPriority);
    update(newPriority);
  };

  return (
    <>
      <label className="font-semibold block mb-1">Приоритет:</label>
      <CustomSelect
        options={priorityOptions}
        value={priority}
        onChange={(val: string) => handlePriorityChange(val as Priority)}
        className="w-full"
      />
    </>
  );
}

function Responsibles({
  task,
  users,
  onSelect,
  deleteResponsible,
}: {
  task: IFullTask;
  users: IMember[];
  onSelect: (userId: string) => void;
  deleteResponsible: (userId: string) => void;
}) {
  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.username,
    avatar: user.avatar_url,
  }));
  return (
    <>
      <label className="font-semibold block mb-1">Ответственные:</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {task.responsibles.map((res) => (
          <div
            key={res.id}
            onClick={() => deleteResponsible(res.id)}
            className="relative flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full overflow-hidden group hover:bg-red-300"
          >
            <motion.div
              className="flex items-center gap-1 group-hover:invisible"
              animate="visible"
            >
              <Image
                src={res.avatar_url ?? ""}
                alt="avatar"
                className="w-6 h-6 rounded-full"
                width={24}
                height={24}
              />
              <span>{res.username}</span>
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <FaTimes className="text-red-600 text-lg" />
            </motion.div>
          </div>
        ))}
        <CustomSelect
          options={userOptions}
          value=""
          onChange={onSelect}
          placeholder="Добавить исполнителя..."
          className="w-full"
        />
      </div>
    </>
  );
}

function SelectDate({
  date,
  dateChange,
}: {
  date: Date | null;
  dateChange: (date: Date | null) => void;
}) {
  return (
    <div className="flex flex-row gap-4 items-center mt-4">
      <label className="font-semibold block mb-1">Срок:</label>
      <DatePicker
        selected={date}
        onChange={dateChange}
        minDate={new Date()}
        dateFormat="dd.MM.yyyy"
        isClearable
        placeholderText="Выберите дату"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-4 py-2">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <FaChevronLeft />
            </button>

            <div className="flex gap-2">
              <select
                value={date.getMonth()}
                onChange={({ target: { value } }) =>
                  changeMonth(parseInt(value))
                }
                className="bg-transparent border rounded px-2 py-1 text-sm cursor-pointer hover:bg-gray-50"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              <select
                value={date.getFullYear()}
                onChange={({ target: { value } }) =>
                  changeYear(parseInt(value))
                }
                className="bg-transparent border rounded px-2 py-1 text-sm cursor-pointer hover:bg-gray-50"
              >
                {Array.from({ length: 10 }).map((_, i) => {
                  const year = new Date().getFullYear() + i - 5;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        calendarClassName="rounded-lg shadow-xl border border-gray-200 p-4"
        dayClassName={(date) => {
          const isWeekend = date.getDay() === 0 || date.getDay() === 6; // 0 - воскресенье, 6 - суббота
          const isToday =
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();

          let className = "rounded-[6px] hover:bg-gray-100";

          if (isToday) {
            className += " bg-blue-100!";
          }

          if (isWeekend) {
            className += " text-red-500! hover:bg-red-100!";
          }

          return className;
        }}
        weekDayClassName={() => "text-gray-500 text-sm font-medium"}
        popperClassName="!pt-2"
        popperPlacement="bottom-start"
      />
    </div>
  );
}

function ProgressBar({ task }: { task: IFullTask }) {
  const completed = task.completed_subtasks;
  const total = task.total_subtasks;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="mb-2 flex items-center gap-2">
      <svg viewBox="0 0 36 36" className="w-8 h-8">
        <path
          className="text-gray-200"
          d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="text-sky-500"
          d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${progress * 0.999}, 100`}
          strokeWidth="4"
        />
      </svg>
      <span className="text-sm text-gray-600">
        {completed} / {total} подзадач
      </span>
    </div>
  );
}

function SubtasksList({
  showList,
  setShowList,
  task,
  deleteSubtask,
  addSubtask,
  changeSubtask,
}: {
  showList: boolean;
  setShowList: (val: boolean) => void;
  task: IFullTask;
  deleteSubtask: (taskID: string) => void;
  changeSubtask: (taskID: string, field: string, val: string | boolean) => void;
  addSubtask: () => void;
}) {
  const [localSubtasks, setLocalSubtasks] = useState(task.subtasks);

  useEffect(() => {
    setLocalSubtasks(task.subtasks);
  }, [task.subtasks]);

  const handleCheckboxChange = (subtaskId: string) => {
    setLocalSubtasks((prev) =>
      prev.map((subtask) => {
        if (subtask.id === subtaskId) {
          const newState = !subtask.is_completed;
          changeSubtask(subtaskId, "is_completed", newState);
          return { ...subtask, is_completed: newState };
        }
        return subtask;
      })
    );
  };

  return (
    <>
      <button
        className="text-sm text-sky-600 underline mb-2"
        onClick={() => setShowList(!showList)}
      >
        {showList ? "Скрыть подзадачи" : "Показать подзадачи"}
      </button>
      {showList && (
        <ul className="space-y-2">
          {localSubtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              handleCheckboxChange={handleCheckboxChange}
              deleteSubtask={deleteSubtask}
              changeSubtask={changeSubtask}
            />
          ))}
          <li>
            <button
              onClick={() => addSubtask()}
              className="text-sky-600 hover:underline cursor-pointer"
            >
              + Добавить подзадачу
            </button>
          </li>
        </ul>
      )}
    </>
  );
}

function SubtaskItem({
  subtask,
  handleCheckboxChange,
  deleteSubtask,
  changeSubtask
}: {
  subtask: ISubtask;
  deleteSubtask: (id: string) => void;
  handleCheckboxChange: (id: string) => void;
  changeSubtask: (taskID: string, field: string, val: string | boolean) => void;
}) {
  const {
    editing: editingSubtaskTitle,
    value: valueSubtaskTitle,
    setValue: setSubtaskTitleValue,
    inputRef: inputSubtaskTitleRef,
    startEditing: startSubtaskTitleEditing,
    finishEditing: finishSubtaskTitleEditing,
    handleKeyDown: handleSubtaskTitleKeyDown,
  } = useInlineEdit({
    initialValue: subtask?.title ?? "",
    onSave: async (newValue) => {
      if (!subtask) return;
      changeSubtask(subtask.id, "title", newValue)
    },
  });
  return (
    <li className="flex items-center justify-between border border-border px-2 py-1 rounded">
      <label className="relative flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={subtask.is_completed}
          onChange={() => handleCheckboxChange(subtask.id)}
          className="absolute opacity-0 w-0 h-0"
        />
        <span
          className={`flex items-center justify-center w-4 h-4 border rounded ${
            subtask.is_completed
              ? "bg-blue-500 border-blue-500"
              : "border-gray-300"
          }`}
        >
          {subtask.is_completed && <FaCheck className="text-white text-xs" />}
        </span>
      </label>
      {editingSubtaskTitle ? (
        <input
          ref={inputSubtaskTitleRef as RefObject<HTMLInputElement>}
          value={valueSubtaskTitle}
          onChange={(e) => setSubtaskTitleValue(e.target.value)}
          onBlur={finishSubtaskTitleEditing}
          onKeyDown={handleSubtaskTitleKeyDown}
          className="flex-1 mx-2 bg-transparent outline-none"
        />
      ) : (
        <span
          onClick={startSubtaskTitleEditing}
          className={`flex-1 mx-2 cursor-pointer ${
            subtask.is_completed && "line-through text-gray-400"
          }`}
        >
          {valueSubtaskTitle}
        </span>
      )}
      <button
        onClick={() => deleteSubtask(subtask.id)}
        className="text-red-500 hover:text-red-700 cursor-pointer"
      >
        <FaTrashAlt size={14} />
      </button>
    </li>
  );
}

