from exeptions.custom_exeptions import DataBaseError, CustomException
import functools
import traceback
import logging


def error_db_handler_wrapper(function):
    """
    Обертка для генерации ошибки DataBaseError в случае если
    произошла ошибка в функциях работы с БД, кроме ошибок CustomException
    :param function:
    :return:
    """
    @functools.wraps(function)
    async def wrapper(*args, **kwargs):
        try:
            return await function(*args, **kwargs)
        except Exception as ex:
            logging.error(traceback.format_exc())
            if not isinstance(ex, CustomException):
                raise DataBaseError(traceback.format_exception_only(type(ex), ex))
            else:
                raise ex
    return wrapper
