import Boards from '@/components/Boards';
import { FilterOption, IMemberBoardShortInfo } from '@/interfaces/Board';
import { useEffect, useState } from 'react';
import { getMyBoards } from './api/board';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function Main() {
  useAuthRedirect()
  const [boards, setBoards] = useState<IMemberBoardShortInfo[] | null>(null);
  useEffect(() => {
    getMyBoards().then(setBoards).catch(console.error);
  }, []);

  const myBoardsFilters: FilterOption[] = [
  {
    label: "Все доски",
    value: "all",
    field: "",
    check: () => true,
  },
  {
    label: "Модератор",
    value: "MODERATOR",
    field: "role",
    check: (board) => 'role' in board && board.role === "MODERATOR",
  },
  {
    label: "Участник",
    value: "MEMBER",
    field: "role",
    check: (board) => 'role' in board && board.role === "MEMBER",
  },
];

  return (
      <div>
        <Boards title='Доступные мне доски' boards={boards} filters={myBoardsFilters}/>
      </div>
    );
}
