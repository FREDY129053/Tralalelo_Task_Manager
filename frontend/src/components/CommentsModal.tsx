import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";
import CommentsList from "./CommentsList";
import WriteComment from "./Writecomment";
import { IComment, Role } from "@/interfaces/Board";

type Props = {
  comments: IComment[];
  onClose: () => void;
  canWrite?: boolean;
  onSendComment?: (text: string) => void;
  onDeleteComment: (commentID: string) => void
  userID: string
  role: Role
};

export default function CommentsModal({
  comments,
  onClose,
  canWrite = false,
  onSendComment,
  onDeleteComment,
  userID,
  role
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSend = (text: string) => {
    if (onSendComment && text.trim()) {
      onSendComment(text);
      setCommentText("");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      <div
        ref={boxRef}
        className="w-full max-w-2xl relative bg-modal-bg border border-[var(--color-board-tint-5)] rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]"
      >
        <button
          className="cursor-pointer absolute right-4 top-4 text-3xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Закрыть"
          type="button"
        >
          <IoMdClose />
        </button>
        <div className="overflow-y-auto flex-1 pr-2">
          <CommentsList comments={comments} onDelete={onDeleteComment} userID={userID} role={role} />
        </div>
        {canWrite && onSendComment && (
          <div className="mt-8">
            <WriteComment
            text={commentText}
            setComment={setCommentText}
            saveComment={handleSend}
          />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}