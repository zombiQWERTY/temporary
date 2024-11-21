from models.user import User
from aiohttp import web
from db_utils.db_directory_list import db_list_directory
from models.directory import Directory
from constants.EssencesType import EssencesType
from exeptions.custom_exeptions import CustomException, BadDirectoryType
from exeptions.builder import get_exception
import logging


async def directory_list(request):
    """
    ---
    tags:
    - directory
    description: Возвращает список папок указанного типа
    produces:
    - application/json
    parameters:
          - name: parentId
            in: path
            required: false
            description: id родительской папки в БД
            schema:
                type : integer
                minimum: 1

    responses:
        "200":
            description: короткая информация о папке (без вложений).
    """
    logging.info('Вызван метод directory_list')
    user = User()
    user.load_from_headers(request.headers)
    space_id = int(request.match_info.get('space_id', 0))
    parent_id = int(request.query.get('parentId', 0))
    try:
        try:
            directory_type = EssencesType[request.match_info.get('dir_type', "None")]
        except KeyError:
            raise BadDirectoryType('Need valid type in URL')
        directories = list()

        directory_record_list = await db_list_directory(user, directory_type, parent_id, space_id)
        for record in directory_record_list:
            directory = Directory()
            directory.deserialize(record)
            directories.append(directory.serialize(short=True))
        return web.json_response({'directories': make_sort(directories)}, status=200)
    except Exception as ex:
        if isinstance(ex, CustomException):
            return ex.get_response()
        else:
            return get_exception()


def make_sort(folder_list):
    """
    Сортирует список папок, уже подготовленный к отправки
    :param folder_list: список
    :return: новый отсортированный список
    """
    sorted_list = list()
    sort_id = 0
    if folder_list is None:
        return sorted_list

    while len(folder_list) > 0:
        in_list = False
        for i in range(0, len(folder_list)):
            if folder_list[i]['customOrder'] == sort_id:
                sort_id = folder_list[i]['id']
                sorted_list.append(folder_list.pop(i))
                in_list = True
                break
        if not in_list:
            logging.error("Ошибка при сортировке списка, получился на связный список")
            break
    return sorted_list
