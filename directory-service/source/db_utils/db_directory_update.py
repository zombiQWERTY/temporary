from python_shared_packages.connection_pool.postgres_client import PostgresClient
from models.user import User
from models.directory import Directory
from db_utils.error_handler_wrapper import error_db_handler_wrapper
import db_utils.db_sort_list
import logging


@error_db_handler_wrapper
async def db_directory_update(user: User, directory_old: Directory, directory_new: Directory):
    """
    Обновляет папку
    :param user: пользователь запросивший удаления
    :param directory_old: старая папка
    :param directory_new: папка подготовленная к записи (после валидации)
    :return: кол-во обновленных папок
    """
    logging.debug(f'Обновляю инф для папки {directory_old.directory_id}')
    client = PostgresClient()
    pool = await client.get_pool(user)
    async with pool.acquire() as connection:
        async with connection.transaction():
            await db_utils.db_sort_list.db_delete_from_sort_tree(directory_old, connection)
            sql = '''update directory set 
                     name=$1, parent_id=$2, update_date=$3, custom_order_id=$4 where id=$5;'''
            await connection.fetchval(sql, directory_new.name, directory_new.parent_id, directory_new.update_date,
                                      directory_new.custom_order_id, directory_new.directory_id)
            logging.debug(f'Инф для папки {directory_old.directory_id} обновлена')
            await db_utils.db_sort_list.db_insert_in_sort_tree(directory_new, connection)
