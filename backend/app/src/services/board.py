from typing import List, Optional
from uuid import UUID

import backend.app.src.repository.board as BoardRepo
from backend.app.src.helpers.jwt import decode_jwt_token
from backend.app.src.schemas import (
    AbsoluteFullBoardInfo,
    ColumnOut,
    CreateBoard,
    CreateColumn,
    FullBoardInfo,
)


async def get_all_boards() -> List[FullBoardInfo]:
    return await BoardRepo.get_all_boards()


async def get_full_board_data(uuid: UUID) -> Optional[AbsoluteFullBoardInfo]:
    board = await BoardRepo.get_full_board_data(uuid)
    if board is None:
        return None

    return board


async def create_board(token: str, board_data: CreateBoard) -> bool:
    user_data = decode_jwt_token(token)
    if not user_data:
        return False
    await BoardRepo.create_board(
        title=board_data.title,
        description=board_data.description,
        color=board_data.color,
        is_public=board_data.is_public,
        creator_id=user_data.get("uuid", ""),
    )

    return True


async def get_board_column_data(uuid: UUID) -> List[ColumnOut]:
    board = await BoardRepo.get_full_board_data(uuid)

    return board.columns


async def create_column(board_uuid: UUID, column_data: CreateColumn) -> Optional[UUID]:
    board = await BoardRepo.get_board(uuid=board_uuid)
    if not board:
        return None

    column = await BoardRepo.create_column(
        board=board,
        title=column_data.title,
        position=column_data.position,
        color=column_data.color,
    )

    return column.id


async def get_comments(uuid: UUID):
    return await BoardRepo.get_comments(id=uuid)


async def write_comment(board_id: UUID, token: str, text: str) -> bool:
    user_data = decode_jwt_token(token=token)
    if not user_data:
        return False

    await BoardRepo.create_comment(id=board_id, user_id=user_data["uuid"], text=text)

    return True
