from models.user import User
from models.directory import Directory
from db_utils.db_directory_create import db_directory_create
from aiohttp import web
from cerberus import Validator
from constants.validation_schemas import directory_schema
from exeptions.custom_exeptions import BadFormat, CustomException
from exeptions.builder import get_exception
from constants.EssencesType import EssencesType
import logging


async def directory_create(request):
    """
    ---
    tags:
    - directory
    description: Создает папку. Папка создается с автором = пользователь который создал
    produces:
    - application/json
    responses:
        "200":
            description: возвращает id созданной папки
            schema:
                properties:
                    directoryId:
                      type: integer
                required:
                    - id
    """
    logging.info('Вызван метод directory_create')
    try:
        # Сначала проверю папку в запросе
        request_body: dict = await request.json()
        validator_directory = Validator(directory_schema)
        validator_directory.schema.validate()
        if not validator_directory.validate(request_body):
            raise BadFormat("No valid request for directory create. %s" %
                            validator_directory.errors)
        # Получаю пользователя из заголовков запроса
        user: User = User()
        user.load_from_headers(request.headers)
        space_id = int(request.match_info.get('space_id', 0))
        # Создаю класс папка
        directory: Directory = Directory()
        directory.deserialize(request_body)
        directory.space_id = space_id
        directory.essences_type = EssencesType[request_body['type']]
        # Добавим автора
        directory.author_id = user.user_id
        # Записываю его в БД
        return web.json_response({'directoryId': await db_directory_create(user, directory)})
    except Exception as ex:
        if isinstance(ex, CustomException):
            return ex.get_response()
        else:
            return get_exception()
