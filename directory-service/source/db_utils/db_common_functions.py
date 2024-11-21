import logging

from db_utils.error_handler_wrapper import error_db_handler_wrapper
from models.directory import Directory
from exeptions.custom_exeptions import BadSortedParameters, BadParentParameters
from settings import folder_nesting


@error_db_handler_wrapper
async def db_directory_exist(directory: Directory, connection):
    """
    Проверяет, что папка существует, если нет выбросит исключение
    :param directory: старая папка
    :param connection: соединение
    """
    # Проверить, что существует папка за которой встать и она того же типа и в том же spaceid
    if directory.custom_order_id > 0:
        sql = """select id from directory where id=$1 and is_delete=FALSE and spaceid=$2 and type_id=$3 
        and author_id=$4 FOR UPDATE;"""
        result = await connection.fetch(sql, directory.custom_order_id, directory.space_id, directory.essences_type.value,
                                        directory.author_id)
        if len(result) != 1:
            logging.debug(f'Папка {directory.directory_id} несуществует')
            raise BadSortedParameters(f'Custom_order_id directory does not exist: {directory}')
    # Проверить, что существует папка родитель и она того же типа и в том же spaceid
    if directory.parent_id > 0:
        sql = """select id from directory where id=$1 and is_delete=FALSE and spaceid=$2 and type_id=$3 
                and author_id=$4;"""
        result = await connection.fetch(sql, directory.parent_id, directory.space_id,
                                        directory.essences_type.value,
                                        directory.author_id)
        if len(result) != 1:
            logging.debug(f'Папка {directory.directory_id} несуществует')
            raise BadParentParameters(f'Parent_id directory does not exist {directory}')
    logging.debug(f'Папка {directory.directory_id} существует')


@error_db_handler_wrapper
async def db_nesting_validate(directory: Directory, connection):
    """
    Проверяет, что папка не является вложеной дальше определенного
    порядка. Это так обеспечивает защиту от зацикливания
    :param directory: папка
    :param connection: соединение
    """
    sql = f"""with recursive id_list(id, parent_id) as (
                select id, parent_id
                from directory where parent_id=$1 and spaceid=$2 and is_delete=FALSE 
                union all
                    select di.id, di.parent_id 
                            from id_list il, directory di where il.id = di.parent_id
                )
                select count(id) from id_list limit {folder_nesting}; 
                """
    directory_nesting = await connection.fetchval(sql, directory.parent_id, directory.space_id)
    if directory_nesting >= folder_nesting:
        logging.error(f'Папка {directory.directory_id} не прошла проверку вложенности')
        raise BadSortedParameters(f'Directory have nesting >= {folder_nesting}')
    logging.debug(f'Папка {directory.directory_id} прошла проверку вложенности')
