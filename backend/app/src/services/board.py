from uuid import UUID

import backend.app.src.repository.board as BoardRepo
from backend.app.src.enums import UserRole
from backend.app.src.helpers.jwt import decode_jwt_token
from backend.app.src.schemas import CreateBoard, CreateColumn, ServiceMessage, UpdateBoard


async def get_all_boards() -> ServiceMessage:
    boards = await BoardRepo.get_all_boards()
    return ServiceMessage(message=boards)


async def get_users_in_boards(token: str) -> ServiceMessage:
    user_data = decode_jwt_token(token)
    if not user_data:
        return ServiceMessage(is_error=True, message="invalid token", status_code=403)

    boards = await BoardRepo.get_all_users_boards(
        user_id=user_data.get("uuid", ""),
    )

    return ServiceMessage(message=boards, status_code=200)


async def get_full_board_data(uuid: UUID) -> ServiceMessage:
    board = await BoardRepo.get_full_board_data(uuid)
    if board is None:
        return ServiceMessage(is_error=True, message="board not found", status_code=404)

    return ServiceMessage(message=board)


async def create_board(token: str, board_data: CreateBoard) -> ServiceMessage:
    user_data = decode_jwt_token(token)
    if not user_data:
        return ServiceMessage(is_error=True, message="invalid token", status_code=403)

    created_id = await BoardRepo.create_board(
        title=board_data.title,
        description=board_data.description,
        color=board_data.color,
        is_public=board_data.is_public,
        creator_id=user_data.get("uuid", ""),
    )

    if not created_id:
        return ServiceMessage(
            is_error=True, message="invalid board data", status_code=400
        )

    return ServiceMessage(message=created_id, status_code=201)


async def get_board_column_data(uuid: UUID) -> ServiceMessage:
    board = await BoardRepo.get_full_board_data(uuid)
    if not board:
        return ServiceMessage(is_error=True, message="board not found", status_code=404)

    return ServiceMessage(message=board.columns)


async def create_column(board_uuid: UUID, column_data: CreateColumn) -> ServiceMessage:
    board = await BoardRepo.get_board(uuid=board_uuid)
    if not board:
        return ServiceMessage(is_error=True, message="board not found", status_code=404)

    column = await BoardRepo.create_column(
        board=board,
        title=column_data.title,
        position=column_data.position,
        color=column_data.color,
    )
    if not column:
        return ServiceMessage(
            is_error=True, message="invalid data! cannot create column", status_code=400
        )

    return ServiceMessage(message="column created", status_code=201)


async def get_comments(uuid: UUID) -> ServiceMessage:
    comments = await BoardRepo.get_comments(id=uuid)
    return ServiceMessage(
        message=comments,
    )


async def write_comment(board_id: UUID, token: str, text: str) -> ServiceMessage:
    user_data = decode_jwt_token(token=token)
    if not user_data:
        return ServiceMessage(is_error=True, message="invalid token", status_code=403)

    comment = await BoardRepo.create_comment(
        id=board_id, user_id=user_data["uuid"], text=text
    )
    if not comment:
        return ServiceMessage(
            is_error=True, message="invalid data! cannot create comment", status_code=400
        )

    return ServiceMessage(message="comment created", status_code=201)


async def get_members(id: UUID) -> ServiceMessage:
    members = await BoardRepo.get_members(board_id=id)

    return ServiceMessage(message=members)


async def add_member(board_id: UUID, user_id: UUID) -> ServiceMessage:
    member = await BoardRepo.add_member(board_id=board_id, user_id=user_id)
    if not member:
        return ServiceMessage(
            is_error=True,
            message="invalid data! cannot add member. check if board or user exists",
            status_code=400,
        )
    return ServiceMessage(message="member added", status_code=201)


async def change_role(board_id: UUID, user_id: UUID, role: UserRole) -> ServiceMessage:
    is_changed = await BoardRepo.change_member_role(
        board_id=board_id, member_id=user_id, role=role
    )
    if not is_changed:
        return ServiceMessage(
            is_error=True, message="board or user not found", status_code=404
        )

    return ServiceMessage(message="role changed")


async def delete_member(board_id: UUID, user_id: UUID) -> ServiceMessage:
    is_deleted = await BoardRepo.delete_member(
        board_id=board_id,
        member_id=user_id,
    )
    if not is_deleted:
        return ServiceMessage(
            is_error=True, message="board or user not found", status_code=404
        )

    return ServiceMessage(message="member deleted")


async def delete_board(id: UUID) -> ServiceMessage:
    is_deleted = await BoardRepo.delete_board(id=id)

    if not is_deleted:
        return ServiceMessage(is_error=True, message="board not found", status_code=404)

    return ServiceMessage(message="board deleted")


async def update_board_fields(column_id: UUID, fields: UpdateBoard) -> bool:
    data_to_update = fields.model_dump(exclude_unset=True)

    await BoardRepo.update_fields(column_id, data_to_update)

    return True
