from models.directory import Directory
from db_utils.error_handler_wrapper import error_db_handler_wrapper
from db_utils.db_common_functions import db_directory_exist
import logging


@error_db_handler_wrapper
async def db_insert_in_sort_tree(directory: Directory, connection):
    """ Функция вставки папки в список для сортировки
    :param directory: папка, с уже заполненым id
    :param connection: соединение
    :return: ничего или выкинет ошибку
    """
    logging.debug(f"Добавляю в список сортировки папку {directory.directory_id}")
    await db_directory_exist(directory, connection)
    sql = """update directory set custom_order_id=$1 
                where id!=$1 and parent_id=$2 and is_delete = FALSE and custom_order_id=$3;"""
    return await connection.fetchrow(sql, directory.directory_id, directory.parent_id, directory.custom_order_id)


@error_db_handler_wrapper
async def db_delete_from_sort_tree(directory: Directory, connection):
    """ Функция удаления папки из сортировки
    :param directory: папка, с уже заполненым id
    :param connection: соединение
    :return: ничего или выкинет ошибку
    """
    logging.debug(f"Удаляю из списка сортировки папку {directory.directory_id}")
    sql = "update directory set custom_order_id = $1 where parent_id = $2 and is_delete = FALSE and custom_order_id=$3;"
    return await connection.fetchrow(sql, directory.custom_order_id, directory.parent_id, directory.directory_id)
