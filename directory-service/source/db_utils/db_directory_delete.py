from python_shared_packages.connection_pool.postgres_client import PostgresClient
from models.user import User
from db_utils.error_handler_wrapper import error_db_handler_wrapper
import db_utils.db_sort_list
from models.directory import Directory
import logging
from settings import folder_nesting


@error_db_handler_wrapper
async def db_directory_delete(user: User, directory: Directory):
    """
    Удаляет папку, все ее вложения. А так же все папку у кого она была родительской и их вложения (и т.д.
    рекурсивно).
    :param user: пользователь запросивший удаления
    :param directory: папки
    :return: кол-во удаленных папок
    """
    client = PostgresClient()
    pool = await client.get_pool(user)
    # Кол-во папок, которые удалил
    count: int = 0
    async with pool.acquire() as connection:
        async with connection.transaction():
            # Формирую список папок на удаление, он понадобится потом 2 раза - удаление, измение сортировки
            sql = f"""
            with recursive id_list(id, parentId) as (
            select id, name, type_id as typeId, 
                        parent_id as parentId,  
                        author_id as authorId, 
                        create_date as createDate, 
                        update_date as updateDate, 
                        custom_order_id as customOrder, 
                        spaceId
            from directory where id = $3 and parent_id=$1  
            and spaceid=$2 and is_delete=FALSE 
            union
                select di.id, di.name, di.type_id as typeId, 
                        di.parent_id as parentId,  
                        di.author_id as authorId, 
                        di.create_date as createDate, 
                        di.update_date as updateDate, 
                        di.custom_order_id as customOrder, 
                        di.spaceId from id_list il, directory di where il.id = di.parent_id
            )
            select * from  id_list limit {folder_nesting}; 
            """
            directory_list = await connection.fetch(sql, directory.parent_id,
                                                    directory.space_id, directory.directory_id)
            for record in directory_list:
                directory_del: Directory = Directory()
                directory_del.deserialize(record)
                # //TODO переписать на массое удаление для ускорения
                # Удаляю папку
                await db_one_directory_delete(directory_del, connection)
                # Удаляю из сортировки
                await db_utils.db_sort_list.db_delete_from_sort_tree(directory_del, connection)
                count += 1
            return count


@error_db_handler_wrapper
async def db_one_directory_delete(directory: Directory, connection):
    """
    Удаляет одну папку
    :param directory: папки
    :param connection: соединение
    :return:
    """
    logging.debug(f"Удаляю папку  {directory.directory_id}")
    sql = "update directory set is_delete=TRUE where id=$1;"
    return await connection.fetchval(sql, directory.directory_id)
