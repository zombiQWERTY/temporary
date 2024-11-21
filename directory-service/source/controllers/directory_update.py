from models.user import User
from models.directory import Directory
from db_utils.db_directory_update import db_directory_update
from aiohttp import web
from cerberus import Validator
from constants.validation_schemas import directory_update_schema
from db_utils.db_directory_get import db_directory_get
from exeptions.custom_exeptions import CustomException, BadFormat
from exeptions.builder import get_exception
import logging


async def directory_update(request):
    """
    ---
    tags:
    - directory
    description: Изменяет существующую папку пользователя. Можно поменять только имя, родителя, сортировку.
        Для смены сортировки передайте параметр на 1 больше, чем тот за которым нужно встать. Или на 1
        меньше, чем тот перед которым нужно встать.
    produces:
    - application/json
    responses:
        "200":
            description: возвращает только код 200
    """
    logging.info('Вызван метод directory_update')
    try:
        # Читаю параметры: тело и номер папки
        request_body: dict = await request.json()
        directory_id = int(request.match_info.get('dir_id', 0))
        space_id = int(request.match_info.get('space_id', 0))

        # Проверяю параметры для update
        validator_directory = Validator(directory_update_schema)
        validator_directory.schema.validate()
        if not validator_directory.validate(request_body):
            raise BadFormat(f"No valid request for directory update. {validator_directory.errors}")

        # Получаю пользователя из заголовков запроса
        user: User = User()
        user.load_from_headers(request.headers)

        # Ищу папку, которую буду update, если не найдет бросить исключений
        directory_old: Directory = Directory()
        directory_old.deserialize(await db_directory_get(user, directory_id, space_id))
        # Создать новую папку
        directory_new: Directory = directory_old.copy()
        directory_new.deserialize(request_body)
        # Записываю его в БД
        await db_directory_update(user, directory_old, directory_new)
        return web.json_response(status=200)
    except Exception as ex:
        if isinstance(ex, CustomException):
            return ex.get_response()
        else:
            return get_exception()

