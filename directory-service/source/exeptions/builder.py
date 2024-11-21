from aiohttp import web
import traceback
from exeptions.messages import get_error_message_by_code
import logging


def get_exception():
    logging.error(traceback.format_exc())
    return web.json_response({'code': 500,
                              'message': get_error_message_by_code(500),
                              'detail': traceback.format_exc()}, status=500)
