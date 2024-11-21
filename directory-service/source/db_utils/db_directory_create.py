from models.user import User
from models.directory import Directory
import logging
from python_shared_packages.connection_pool.postgres_client import PostgresClient
import db_utils.db_sort_list
from db_utils.error_handler_wrapper import error_db_handler_wrapper
from db_utils.db_common_functions import db_nesting_validate


@error_db_handler_wrapper
async def db_directory_create(user: User, directory: Directory):
    """
    Создает папку
    :param user: пользователь запросивший создание папки
    :param directory: папка подготовленная к записи (после валидации)
    :return: кол-во удаленных папок
    """

    client = PostgresClient()
    pool = await client.get_pool(user)
    async with pool.acquire() as connection:
        async with connection.transaction():
            sql = '''INSERT INTO directory(name, parent_id, author_id, create_date, update_date, custom_order_id, 
                type_id, spaceId)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;'''
            directory.directory_id = await connection.fetchval(sql, directory.name, directory.parent_id,
                                                               directory.author_id, directory.create_date,
                                                               directory.update_date,
                                                               directory.custom_order_id,
                                                               directory.essences_type.value,
                                                               directory.space_id)
            logging.debug('Создал папку с id=%s' % directory.directory_id)
            await db_utils.db_sort_list.db_insert_in_sort_tree(directory, connection)
            await db_nesting_validate(directory, connection)
            return directory.directory_id
