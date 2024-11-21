from models.user import User
from aiohttp import web
from db_utils.db_directory_list_search import db_levenshtein_search
from models.directory import Directory
from exeptions.custom_exeptions import CustomException, BadDirectoryName, BadDirectoryType
from exeptions.builder import get_exception
from constants.EssencesType import EssencesType
import logging


async def directory_list_search(request):
    """
    ---
    tags:
    - directory
    description: Возвращает список папок удовлетворяющих условию поиска
    produces:
    - application/json
    parameters:
          - name: name
            in: path
            required: true
            description: название папки
            schema:
                type : string
                minimum: 2

    responses:
        "200":
            description: список короткая информация о папке (без вложений).
    """
    logging.info('Вызван метод directory_list_search')
    user = User()
    user.load_from_headers(request.headers)
    space_id = int(request.match_info.get('space_id', 0))
    try:
        try:
            dir_type: int = EssencesType[request.match_info.get('dir_type')].value
        except KeyError:
            raise BadDirectoryType("Bad directory type in search request")
        name: str = request.query.get('name', None)
        limit: int = int(request.query.get('limit', 10))
        levenshtein_distance: int = int(request.query.get('distance', 10))
        if limit > 20:
            limit = 20
        if name is None:
            raise BadDirectoryName('Directory name must be not null')
        if len(name) < 2:
            raise BadDirectoryName('Directory name must have 2 char or more')
        directories = list()
        for record in await db_levenshtein_search(user, name, space_id, dir_type, limit, levenshtein_distance):
            directory = Directory()
            directory.deserialize(record)
            directories.append(directory.serialize(short=True))
        return web.json_response({'directories': directories}, status=200)
    except Exception as ex:
        if isinstance(ex, CustomException):
            return ex.get_response()
        else:
            return get_exception()
