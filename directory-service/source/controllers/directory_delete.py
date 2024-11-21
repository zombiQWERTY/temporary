from models.user import User
from db_utils.db_directory_delete import db_directory_delete
from aiohttp import web
from db_utils.db_directory_get import db_directory_get
from models.directory import Directory
from exeptions.custom_exeptions import CustomException
from exeptions.builder import get_exception
import logging


async def directory_delete(request):
    """
    ---
    tags:
    - directory
    description: Удаляет папку. Можно удалить только свою, при удалении рекурсивно почистит все папки у которых
        она была родителем и все их вложения.
    produces:
    - application/json
    responses:
        "200":
            description: возвращает id созданной папки
            schema:
                properties:
                    deleted:
                      type: integer
                required:
                    - id
    """
    logging.info('Вызван метод directory_delete')
    try:
        user = User()
        user.load_from_headers(request.headers)
        directory_id = int(request.match_info.get('dir_id', 0))
        space_id = int(request.match_info.get('space_id', 0))
        # Проверим, что такая папка есть. Если нету, то бросит исключение
        directory: Directory = Directory()
        directory.deserialize(await db_directory_get(user, directory_id, space_id))
        count: int = await db_directory_delete(user, directory)
        return web.json_response({'deleted': count}, status=200)
    except Exception as ex:
        if isinstance(ex, CustomException):
            return ex.get_response()
        else:
            return get_exception()
