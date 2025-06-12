import Boards from '@/components/Boards';
import { FilterOption, IBoardShortInfo } from '@/interfaces/Board';
import { useEffect, useState } from 'react';
import { getBoards } from './api/board';

export default function Main() {
  const [boards, setBoards] = useState<IBoardShortInfo[] | null>(null);
  useEffect(() => {
    getBoards().then(setBoards).catch(console.error);
  }, []);

  const myBoardsFilters: FilterOption[] = [
  {
    label: "Все доски",
    value: "all",
    field: "",
    check: () => true,
  },
  {
    label: "Публичные",
    value: "public",
    field: "is_public",
    check: (board) => board.is_public,
  },
  {
    label: "Приватные",
    value: "private",
    field: "is_public",
    check: (board) => !board.is_public,
  },
];

  return (
      <div>
        <Boards title='Мои доски' boards={boards} filters={myBoardsFilters}/>
      </div>
    );
}
