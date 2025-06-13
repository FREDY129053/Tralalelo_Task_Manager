import returnDate from "@/helpers/NormalDate";
import { IComment, Role } from "@/interfaces/Board";
import Image from "next/image";
import { FaTrashAlt } from "react-icons/fa";

type Props = {
  comments: IComment[];
  onDelete: (id: string) => void;
  userID?: string;
  role?: Role;
};

export default function CommentsList({
  comments,
  onDelete,
  userID,
  role,
}: Props) {
  return (
    <>
      <label className="font-semibold block mb-2">Комментарии:</label>
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-400">Нет комментариев</p>
        ) : (
          [...comments]
            .reduce(
              (
                acc: { date: string; comments: IComment[] }[],
                comment: IComment
              ) => {
                const date = returnDate(comment.created_at).split(" ")[0];
                if (!acc.length || acc[acc.length - 1].date !== date) {
                  acc.push({ date, comments: [comment] });
                } else {
                  acc[acc.length - 1].comments.push(comment);
                }
                return acc;
              },
              [] as { date: string; comments: IComment[] }[]
            )
            .map((group) => (
              <div key={group.date}>
                <div className="text-xs text-gray-500 mb-1">{group.date}</div>
                {group.comments.map((c: IComment) => (
                  <div
                    key={c.id}
                    className="flex gap-2 border-b pb-2 mb-2 items-center relative group"
                  >
                    <Image
                      src={c.user.avatar_url || ""}
                      alt="avatar"
                      className="w-6 h-6 rounded-full -mt-7"
                      width={100}
                      height={100}
                    />
                    <div>
                      <div className="text-sm font-medium">
                        {c.user.username}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {returnDate(c.created_at)}
                      </div>
                      <div>{c.content}</div>
                    </div>
                    {(role !== "MEMBER" || userID === c.user.id) && (
                      <>
                        <button
                          className="absolute right-4 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(c.id);
                          }}
                          title="Удалить"
                        >
                          <FaTrashAlt className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))
        )}
      </div>
    </>
  );
}
