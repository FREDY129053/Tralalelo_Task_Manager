type Props = {
text: string;
  setComment: (val: string) => void;
  saveComment: (val: string) => void;
}

export default function WriteComment({
  text,
  setComment,
  saveComment
}: Props) {
  return (
    <div className="sticky bottom-0 bg-white border-t p-4 w-full">
      <div className="flex gap-2 w-full">
        <input
          type="text"
          value={text}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Введите комментарий..."
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
        />
        <button
          onClick={() => {
            saveComment(text)
            setComment("")
          }}
          className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition-colors"
        >
          Отправить
        </button>
      </div>
    </div>
  );
}