import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
}

interface Column {
  id: string;
  title: string;
  position: number;
  color: string | null;
  tasks: Task[];
}

const columns: Column[] = [
  {
    id: "185FA5AE-5D49-496C-9FE2-162A6B623A89",
    title: "First",
    position: 0,
    color: null,
    tasks: [
      {
        id: "E1748F2A-9F16-4037-B9D8-024DDD97B30B",
        title: "IDK 1",
        description: "окей",
        color: null,
      },
      {
        id: "9369B86D-EEAB-48B0-935D-9B25CE1FE26A",
        title: "IDK 2",
        description: null,
        color: null,
      },
    ],
  },
  {
    id: "643178FD-C2C1-4550-B5C2-9B61E6C2D843",
    title: "Second",
    position: 1,
    color: "#a341fe",
    tasks: [
      {
        id: "5EE985A5-E41C-44FB-BF9C-6942EFE0B6AD",
        title: "IDK 3",
        description: null,
        color: null,
      },
    ],
  },
  {
    id: "C283C667-9841-4CE1-B13C-F4CF1FC6B89C",
    title: "Third",
    position: 2,
    color: null,
    tasks: [
      {
        id: "D98C37A1-740A-4A85-ACBA-C94908B991D6",
        title: "IDK 4",
        description: "хоккей епт",
        color: null,
      },
      {
        id: "026A4D76-22CC-4690-9ACA-38199EFB6FB0",
        title: "IDK 5",
        description: null,
        color: null,
      },
      {
        id: "71A76299-D2DB-4923-8803-B54A2E9655D3",
        title: "IDK 6",
        description: null,
        color: null,
      },
    ],
  },
  {
    id: "D292FE95-2DBC-4A28-9388-380C96A7DEAE",
    title: "Fourth",
    position: 3,
    color: "#ef1287",
    tasks: [],
  },
];

export default function BoardPage() {
  const [boardColumns, setBoardColumns] = useState(columns);
  const columnsIds = boardColumns.map((c) => c.id);

  // Для рендера overlay
  const [activeItem, setActiveItem] = useState<Column | Task | null>(null);

  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function findColumn(id?: string) {
    if (id) {
      if (columnsIds.includes(id)) return id;
      const column = boardColumns?.find((i) =>
        i.tasks?.find((j) => j?.id === id)
      );

      return column?.id;
    }
  }

  function isSortingColumns({
    activeId,
    overId,
  }: {
    activeId: string;
    overId: string;
  }) {
    const isActiveColumn = columnsIds.includes(activeId);
    const isOverColumn = findColumn(overId) || columnsIds.includes(overId);

    return !!isActiveColumn && !!isOverColumn;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeId = active.id as string;

    if (columnsIds.includes(activeId)) {
      const column = boardColumns.find((i) => i.id === activeId);
      if (column) setActiveItem(column);
    } else {
      const columnId = findColumn(activeId);
      const column = boardColumns.find((i) => i.id === columnId);
      const item = column?.tasks.find((i) => i.id === activeId);
      if (item) setActiveItem(item);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!active || !over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumnId = findColumn(activeId);
    const overColumnId = findColumn(overId);
    if (!activeColumnId || !overColumnId) return;

    if (isSortingColumns({ activeId, overId })) return;

    if (activeColumnId !== overColumnId) {
      const activeColumn = boardColumns.find((i) => i.id === activeColumnId);
      const overColumn = boardColumns.find((i) => i.id === overColumnId);
      const activeTasks = activeColumn?.tasks || [];
      const activeIndex = activeTasks.findIndex((i) => i.id === activeId);
      const overTasks = overColumn?.tasks || [];
      const overIndex = overTasks.findIndex((i) => i.id === overId);

      let newIndex: number;
      if (columnsIds.includes(overId)) {
        newIndex = overTasks.length + 1;
      } else {
        const isBelowOverTask =
          over 
          // active.rect.current.translated &&
          // active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverTask ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overTasks.length + 1;
      }

      const newItems = boardColumns.map((item) =>
        item.id === activeColumnId
          ? {
              ...item,
              tasks: activeTasks.filter((item) => item.id !== active.id),
            }
          : item.id === overColumnId
          ? {
              ...item,
              tasks: [
                ...item.tasks.slice(0, newIndex),
                activeTasks[activeIndex],
                ...overTasks.slice(newIndex, item.tasks.length),
              ],
            }
          : item
      );
      setBoardColumns(newItems);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeColumnId = findColumn(activeId);
    const overColumnId = findColumn(overId);

    if (isSortingColumns({ activeId, overId })) {
      if (activeId !== overId) {
        setBoardColumns((items) => {
          const oldIndex = boardColumns.findIndex(
            (f) => f.id === activeColumnId
          );
          const newIndex = boardColumns.findIndex((f) => f.id === overColumnId);

          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }

    if (activeColumnId === overColumnId) {
      const activeColumn = boardColumns.find((i) => i.id === activeColumnId);
      const activeTasks = activeColumn?.tasks || [];
      const oldIndex = activeTasks.findIndex((i) => i.id === activeId);
      const newIndex = activeTasks.findIndex((i) => i.id === overId);

      const newItems = boardColumns.map((c) =>
        c.id === activeColumnId
          ? {
              ...c,
              tasks: arrayMove(c.tasks, oldIndex, newIndex),
            }
          : c
      );

      if (oldIndex !== newIndex) {
        setBoardColumns(newItems);
      }
    }
  }

  return (
    <ul className="m-6 flex gap-6 h-[calc(100%-3rem)]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
      >
        <SortableContext
          items={boardColumns}
          strategy={horizontalListSortingStrategy}
        >
          {boardColumns.map((val, index) => (
            <DragColumn key={index} column={val} />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <>
              {columnsIds.includes(activeItem.id) ? (
                <OverlayContainer {...(activeItem as Column)}/>
              ) : (
                <OverlayItem {...(activeItem as Task)}/>
              )}
            </>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ul>
  );
}

function DragColumn({ column }: { column: Column }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    // data: { type: "container" },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="border border-blue-400 rounded-lg py-2 bg-blue-600"
    >
      <p {...attributes} {...listeners} className="text-xl text-center px-16">
        {column.title}
      </p>
      <div className="border-red-500 border h-[100px]">
        <SortableContext
          items={column.tasks}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((val, index) => (
            <DragTask key={index} task={val} />
          ))}
        </SortableContext>
      </div>
    </li>
  );
}

function DragTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    // data: { name, type: "item" },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  };
  return (
    <div ref={setNodeRef} style={{ ...style }}>
      <div
        {...listeners}
        {...attributes}
        className="flex flex-col gap-2 text-base px-2 border border-amber-400"
      >
        <span className="text-center text-xl">{task.title}</span>
        {task.description}
      </div>
    </div>
  );
}

function OverlayContainer(props: Column) {
  return (
    <li className="border border-blue-400 rounded-lg py-2 px-16 bg-blue-600">
      <p className="text-xl text-center w-full">{props.title}</p>
      <div className="border-red-500">
        {props.tasks.map((val, index) => (
          <OverlayItem key={index} {...val} />
        ))}
      </div>
    </li>
  );
}

function OverlayItem(props: Task) {
  return (
    <div>
      <div className="flex flex-col gap-2 text-base">
        <span className="text-center text-xl">{props.title}</span>
        {props.description}
      </div>
    </div>
  );
}
