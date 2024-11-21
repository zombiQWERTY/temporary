from models.user import User
from models.directory import Directory
from db_utils.db_directory_get import db_directory_get
from aiohttp import web
from exeptions.custom_exeptions import CustomException
from exeptions.builder import get_exception
import logging


async def directory_get(request):
    """
    ---
    tags:
    - directory
    description: Возвращает подробную информацию о папке
    produces:
    - application/json
    responses:
        "200":
            description: папка и все ее вложения
    """
    logging.info('Вызван метод directory_get')
    try:
        # Получаю пользователя из заголовков запроса
        user = User()
        user.load_from_headers(request.headers)
        dir_id = int(request.match_info.get('dir_id', 0))
        space_id = int(request.match_info.get('space_id', 0))
        # Получаю папку
        directory = Directory()
        directory.deserialize(await db_directory_get(user, dir_id, space_id))
        return web.json_response(directory.serialize())
    except Exception as ex:
        if isinstance(ex, CustomException):
            return ex.get_response()
        else:
            return get_exception()
