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
import React from "react";
import { nanoid } from "nanoid";
import { MdDragIndicator } from "react-icons/md";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

function createData(length: number, initializer: (index: number) => string) {
  return [...new Array(length)].map((_, index) => {
    return {
      id: nanoid(),
      name: `${initializer(index)}`,
    };
  });
}

export const initialItems = [
  {
    id: nanoid(),
    name: "Container A",
    items: createData(2, (index) => `ITEM A${index + 1}`),
  },
  {
    id: nanoid(),
    name: "Container B",
    items: createData(2, (index) => `ITEM B${index + 1}`),
  },
  {
    id: nanoid(),
    name: "Container C",
    items: createData(2, (index) => `ITEM C${index + 1}`),
  },
  {
    id: nanoid(),
    name: "Container D",
    items: createData(10, (index) => `ITEM D${index + 1}`),
  },
  {
    id: nanoid(),
    name: "Container E",
    items: createData(4, (index) => `ITEM E${index + 1}`),
  },
];

export type Item = {
  id: string;
  name: string;
};

export default function App() {
  const [sortables, setSortables] = React.useState([...initialItems]);
  const [activeItem, setActiveItem] = React.useState<
    SortableContainerProps | Item | null
  >(null);
  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const containerIds = sortables.map((s) => s.id);

  return (
    <DndContext
      collisionDetection={closestCorners}
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
    >
      <SortableContext
        items={sortables}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex h-full justify-center w-screen gap-6 p-6 overflow-x-auto">
          {sortables.map((s) => (
            <SortableContainer
              key={s.id}
              id={s.id}
              name={s.name}
              items={s.items}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <>
            {containerIds.includes(activeItem.id) ? (
              <OverlayContainer {...(activeItem as SortableContainerProps)} />
            ) : (
              <OverlayItem {...(activeItem as Item)} />
            )}
          </>
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  function findContainer(id?: string) {
    if (id) {
      if (containerIds.includes(id)) return id;
      const container = sortables?.find((i) =>
        i.items?.find((l) => l?.id === id)
      );

      return container?.id;
    }
  }

  /*Returns true if we are sorting containers
   * we will know if we are sorting containers if the id of the active item is a
   * container id and it is being dragged over any item in the over container
   * or the over container itself
   */
  function isSortingContainers({
    activeId,
    overId,
  }: {
    activeId: string;
    overId: string;
  }) {
    const isActiveContainer = containerIds.includes(activeId);
    const isOverContainer =
      findContainer(overId) || containerIds.includes(overId);
    return !!isActiveContainer && !!isOverContainer;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeId = active.id as string;

    if (containerIds.includes(activeId)) {
      const container = sortables.find((i) => i.id === activeId);
      if (container) setActiveItem(container);
    } else {
      const containerId = findContainer(activeId);
      const container = sortables.find((i) => i.id === containerId);
      const item = container?.items.find((i) => i.id === activeId);
      if (item) setActiveItem(item);
    }
  }

  /*In this function we handle when a sortable item is dragged from one container 
    to another container, to do this we need to know:
     - what item is being dragged 
     - what container it is being dragged from
     - what container it is being dragged to
     - what index to insert the active item into, in the new container
     */
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!active || !over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainerId = findContainer(activeId);
    const overContainerId = findContainer(overId);
    if (!overContainerId || !activeContainerId) return;

    if (isSortingContainers({ activeId, overId })) return;

    if (activeContainerId !== overContainerId) {
      const activeContainer = sortables.find((i) => i.id === activeContainerId);
      const overContainer = sortables.find((i) => i.id === overContainerId);
      const activeItems = activeContainer?.items || [];
      const activeIndex = activeItems.findIndex((i) => i.id === activeId);
      const overItems = overContainer?.items || [];
      const overIndex = sortables.findIndex((i) => i.id === overId);
      let newIndex: number;
      if (containerIds.includes(overId)) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      const newItems = sortables.map((item) =>
        item.id === activeContainerId
          ? {
              ...item,
              items: activeItems.filter((item) => item.id !== active.id),
            }
          : item.id === overContainerId
          ? {
              ...item,
              items: [
                ...item.items.slice(0, newIndex),
                activeItems[activeIndex],
                ...overItems.slice(newIndex, item.items.length),
              ],
            }
          : item
      );

      setSortables(newItems);
    }
  }

  /*In this function we handle when a sortable item is sorted within its container
      or when a sortable container is sorted with other sortable container
     */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainerId = findContainer(activeId);
    const overContainerId = findContainer(overId);

    if (isSortingContainers({ activeId, overId })) {
      if (activeId !== overId) {
        setSortables((items) => {
          const oldIndex = sortables.findIndex(
            (f) => f.id === activeContainerId
          );
          const newIndex = sortables.findIndex((f) => f.id === overContainerId);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }

    if (activeContainerId === overContainerId) {
      const activeContainer = sortables.find((i) => i.id === activeContainerId);
      const activeItems = activeContainer?.items || [];
      const oldIndex = activeItems.findIndex((i) => i.id === activeId);
      const newIndex = activeItems.findIndex((i) => i.id === overId);
      const newItems = sortables.map((s) =>
        s.id === activeContainerId
          ? {
              ...s,
              items: arrayMove(s.items, oldIndex, newIndex),
            }
          : s
      );

      if (oldIndex !== newIndex) {
        setSortables(newItems);
      }
    }
  }
}

export type SortableContainerProps = {
  id: string;
  name?: string;
  items: Item[];
};

export function SortableContainer(props: SortableContainerProps) {
  const { name, id, items } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: { name, type: "container" },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style }}
      className="flex items-start bg-sky-400 gap-2 w-2xs rounded-lg shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] z-10 min-h-full"
    >
      <div className="flex flex-col gap-2 w-full h-full">
        <div
          {...listeners}
          {...attributes}
          className="sticky z-10 active:cursor-grab flex items-center justify-center w-full p-2 text-2xl leading-8 font-black rounded-t-[6px] bg-sky-600 shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] cursor-grab"
        >
          {name}
        </div>
        <div className="flex flex-col items-center gap-2 w-full p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-700">
          {items.length === 0 ? (
            <div
              key={id}
              className="flex items-center justify-center w-full h-20 text-2xl leading-8 font-semibold text-white uppercase"
            >
              List is empty
            </div>
          ) : (
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              {items.map((s) => (
                <SortableItem {...s} key={s.id} />
              ))}
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
}

export function OverlayContainer(props: SortableContainerProps) {
  const { name, id, items } = props;

  return (
    <div className="flex items-start bg-sky-400 gap-2 w-full rounded-lg shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] z-10 min-h-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-center w-full p-2 text-2xl leading-8 font-black rounded-t-[6px] bg-sky-600 shadow-[inset_0_0_0_1px_hsl(0deg_0%_100%_/_10%)] cursor-grabbing">
          {name}
        </div>

        <div className="flex flex-col items-center gap-2 w-full p-4">
          {items.length === 0 ? (
            <div
              key={id}
              className="flex items-center justify-center w-full h-20 text-2xl leading-8 font-semibold text-white uppercase"
            >
              List is empty
            </div>
          ) : null}
          {items.map((s) => (
            <OverlayItem {...s} key={s.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

type SortableItemProps = {
  id: string;
  name?: string;
};

export function SortableItem(props: SortableItemProps) {
  const { name, id } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: { name, type: "item" },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style }}
      className="flex w-full h-16 text-2xl leading-8 items-center rounded-lg bg-sky-600 p-3 z-10 g-2 font-black"
    >
      <MdDragIndicator
        className="h-6 w-6 cursor-grab text-sky-300 active:cursor-grabbing focus:outline-2 focus:outline-transparent focus:outline-offset-2"
        {...listeners}
        {...attributes}
      />
      <span>{name}</span>
    </div>
  );
}

export function OverlayItem(props: { name: string }) {
  const { name } = props;
  return (
    <div className="flex w-full h-16 text-2xl leading-8 items-center rounded-lg bg-sky-600 p-3 z-10 g-2 font-black">
      <MdDragIndicator className="h-6 w-6 text-sky-300 active:cursor-grabbing focus:outline-2 focus:outline-transparent focus:outline-offset-2 cursor-grabbing" />
      <span>{name}</span>
    </div>
  );
}
