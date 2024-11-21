from aiohttp import web
from settings import version
import logging


async def version_get(request):
    """
    ---
    tags:
    - version
    description: Возвращает версию ПО
    produces:
    - application/json
    responses:
        "200":
            description: версия ПО
    """
    logging.info('Вызван метод version_get')
    return web.json_response({'version': version})
