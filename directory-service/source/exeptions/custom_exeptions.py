from aiohttp import web
import logging
from exeptions.messages import get_error_message_by_code


class CustomException(Exception):
    """
    Базовый класс для всех моих исключений, в нем важен метод get_response, который все они наследуют.
    """

    def __init__(self, detail):
        self.status: int = 500
        self.code: int = 500
        self.message: str = "Base error"
        self.detail: str = ""
        Exception.__init__(self, self.message)

    def get_response(self):
        logging.error(f'code={self.code}, message={self.message}, detail={self.detail}')
        return web.json_response({'code': self.code,
                                  'message': self.message,
                                  'detail': self.detail}, status=self.status)


class DirectoryNotFound(CustomException):

    def __init__(self, detail):
        self.status = 404
        self.code = 40410
        self.message = get_error_message_by_code(self.code)
        self.detail = detail
        logging.warning(self.message)
        Exception.__init__(self, self.message)


class BadFormat(CustomException):

    def __init__(self, detail):
        self.status = 400
        self.code = 40030
        self.message = get_error_message_by_code(self.code)
        self.detail = detail
        logging.warning(self.message)
        Exception.__init__(self, self.message)


class BadDirectoryType(CustomException):

    def __init__(self, detail):
        self.status = 400
        self.code = 40020
        self.message = get_error_message_by_code(self.code)
        self.detail = detail
        logging.warning(self.message)
        Exception.__init__(self, self.message)


class BadDirectoryName(CustomException):

    def __init__(self, detail):
        self.status = 400
        self.code = 40030
        self.message = get_error_message_by_code(self.code)
        self.detail = detail
        logging.warning(self.message)
        Exception.__init__(self, self.message)


class BadSortedParameters(CustomException):
    """
    Ошибка связанная с операциями сортировки списка папок у родителя
    """
    def __init__(self, detail):
        self.status = 400
        self.code = 40040
        self.message = get_error_message_by_code(self.code)
        self.detail = detail
        logging.warning(self.message)
        Exception.__init__(self, self.message)


class BadParentParameters(CustomException):
    """
    Ошибка связанная с неправильным id родителя
    """
    def __init__(self, detail):
        self.status = 400
        self.code = 40050
        self.message = get_error_message_by_code(self.code)
        self.detail = detail
        logging.warning(self.message)
        Exception.__init__(self, self.message)



class DataBaseConnect(CustomException):

    def __init__(self, detail):
        self.status = 500
        self.code = 50010
        self.message = get_error_message_by_code(self.code)
        self.detail = detail
        logging.warning(self.message)
        Exception.__init__(self, self.message)


class DataBaseError(CustomException):
    """
    Default ошибка для всех функций работающих с БД
    """
    def __init__(self, detail):
        self.status = 500
        self.code = 50020
        self.message = get_error_message_by_code(self.code)
        self.detail = detail
        logging.warning(self.message)
        Exception.__init__(self, self.message)
