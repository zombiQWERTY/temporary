from python_shared_packages.connection_pool.postgres_client import PostgresClient
from models.user import User
from constants.EssencesType import EssencesType
from db_utils.error_handler_wrapper import error_db_handler_wrapper


@error_db_handler_wrapper
async def db_list_directory(user: User, directory_type: EssencesType, parent_id: int, space_id: int):
    """
    Получает список папок пользователя, без их вложений
    :param user: пользователь
    :param directory_type: тип папки
    :param parent_id: родительская папка
    :param space_id: пространство
    :return: возвращает записи типа Record - папка и список ее вложений
    """
    client = PostgresClient()
    pool = await client.get_pool(user)
    async with pool.acquire() as connection:
        async with connection.transaction():
            # Получаю все не удаленные папки пользователя, у которых нет родителя
            sql = '''select distinct parent.id, parent.name, parent.type_id as typeId, parent.parent_id as parentId, 
                        parent.author_id as authorId, 
                        parent.create_date as createDate, 
                        parent.update_date as updateDate, 
                        parent.custom_order_id as customOrder,
                        parent.spaceId, 
                        case when child.id is not null and child.is_delete=false 
                                then true else false end as is_parent
                        from directory parent
                            left join directory child on parent.id=child.parent_id
                            where parent.is_delete=FALSE and parent.author_id = $1 and parent.type_id=$2 
                            and parent.parent_id=$3 and parent.spaceId=$4 
                            order by parent.custom_order_id asc, parent.update_date desc;'''
            return await connection.fetch(sql, user.user_id, directory_type.value, parent_id, space_id)
