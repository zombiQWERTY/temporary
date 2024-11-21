from db_utils.error_handler_wrapper import error_db_handler_wrapper
from models.user import User
from python_shared_packages.connection_pool.postgres_client import PostgresClient


@error_db_handler_wrapper
async def db_levenshtein_search(user: User, name: str, space_id: int, dir_type: int, limit=10, levenshtein_distance=10):
    """
    Выполняет нечеткий поиск по https://www.freecodecamp.org/news/fuzzy-string-matching-with-postgresql/
    :param user: пользователь
    :param name: имя папки
    :param space_id: пространство
    :param dir_type: тип папки
    :param limit: сколько вернуть
    :param levenshtein_distance: расстояние Ливинштейна
    :return: возвращает записи типа Record - папка и список ее вложений
    """
    client = PostgresClient()
    pool = await client.get_pool(user)
    async with pool.acquire() as connection:
        async with connection.transaction():
            sql = '''select distinct id, name, 
                        type_id as typeId, 
                        parent_id as parentId, 
                        author_id as authorId, 
                        create_date as createDate, 
                        update_date as updateDate,
                        spaceId, 
                        custom_order_id as customOrder, LEVENSHTEIN(name, $2) as lev
                    FROM directory
                    where is_delete=false and author_id=$1 and spaceId=$5 and type_id=$6 and LEVENSHTEIN(name, $2)<$4
                    ORDER BY lev asc, name asc
                    limit $3;'''
            return await connection.fetch(sql, user.user_id, name, limit, levenshtein_distance, space_id, dir_type)
