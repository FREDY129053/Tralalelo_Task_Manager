import Link from "next/link";

const boards = [
  { id: "1", title: "First", description: "IDK", isPublic: true, color: null },
  {
    id: "2",
    title: "Second",
    description: "Sosal",
    isPublic: false,
    color: null,
  },
  {
    id: "3",
    title: "Third",
    description: "lorem ipsum bla bla bla bla",
    isPublic: true,
    color: "#3f134a",
  },
  {
    id: "4",
    title: "Fourth",
    description: "waba daba lab dab",
    isPublic: false,
    color: null,
  },
  {
    id: "5",
    title: "Fifth",
    description: "UNDEAD | UNLUCK",
    isPublic: true,
    color: null,
  },
];

export default function Boards() {
  return (
    <div className="m-6 grid grid-cols-2 gap-6 items-center justify-center">
      {boards.map((board, index) => (
        <Link href={`boards/${board.id}`} key={index} className="border border-amber-400 rounded-lg">
          <p className="text-xl text-center">{board.title}</p>
          <p className="p-4">{board.description}</p>
        </Link>
      ))}
    </div>
  );
}
