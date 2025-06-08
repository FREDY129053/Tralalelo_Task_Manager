import { useEffect, useRef, useState } from "react";

type UseInlineEditProps = {
  initialValue: string;
  onSave: (newValue: string) => Promise<void> | void;
};

export function useInlineEdit({ initialValue, onSave }: UseInlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      setValue(initialValue);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing, initialValue]);

  const startEditing = () => setEditing(true);

  const finishEditing = async () => {
    setEditing(false);
    if (value.trim() !== "" && value !== initialValue) {
      await onSave(value);
    }
  };

  const cancelEditing = () => setEditing(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      finishEditing();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  return {
    editing,
    value,
    setValue,
    inputRef,
    startEditing,
    finishEditing,
    handleKeyDown,
  };
}
