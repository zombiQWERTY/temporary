from python_shared_packages.connection_pool.postgres_client import PostgresClient
from models.user import User
from exeptions.custom_exeptions import DirectoryNotFound
from db_utils.error_handler_wrapper import error_db_handler_wrapper


@error_db_handler_wrapper
async def db_directory_get(user: User, directory_id: int, space_id: int):
    """
    Получает из БД одну папку
    :param user: пользователь
    :param directory_id: номер папки
    :param space_id: номер пространства
    :return: возвращает записи типа Record - папка и список ее вложений
    """
    client = PostgresClient()
    pool = await client.get_pool(user)

    async with pool.acquire() as connection:
        async with connection.transaction():
            # Скачиваю папку если она принадлежит пользователю и не удалена
            sql = '''select 
                        parent.id, parent.name, 
                        parent.type_id as typeId, 
                        parent.parent_id as parentId,  
                        parent.author_id as authorId, 
                        parent.create_date as createDate, 
                        parent.update_date as updateDate, 
                        parent.custom_order_id as customOrder, 
                        parent.spaceId,
                        case when child.id is not null and child.is_delete=false then true else false end as is_parent
                    from directory parent
                        left join directory child on parent.id=child.parent_id
                    where parent.id = $2 and
                          parent.author_id = $1 and
                          parent.is_delete=FALSE and 
                          parent.spaceId = $3
                    order by parent.update_date desc, parent.create_date asc;'''
            directory_record = await connection.fetchrow(sql, user.user_id, directory_id, space_id)
            if not directory_record:
                raise DirectoryNotFound(f"Directory {directory_id} for user {user.user_id} not found")
            return directory_record
