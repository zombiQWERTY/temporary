from models.user import User
import asyncpg
from exeptions.custom_exeptions import DataBaseConnect
import traceback
import logging
from python_shared_packages.consul.ConsulService import ConsulService
import settings as settings
from singleton_decorator import singleton
from python_shared_packages.connection_pool.connection_pool import ConnectionPool


@singleton
class PostgresClient:
    """
    Клиент для работы в БД postgres. При создании экземпляра он делает пул
    соединений с сервером postgres. Внутри себя он создает пул соединений для
    каждого tenant. Т.к. клиент у меня содержит пулы для БД и раздает их,
    то его надо создать только один раз, чтобы не было слишком много соединений, это
    обеспечено singleton
    """

    def __init__(self):
        # Пул соединения с postgres
        self.__postgres_service_pool = None
        # Пул соедиенений с БД
        self.__db_connection_pools: dict = dict()
        # Контекст приложения
        self.app_context = dict()

    def start(self, app_context):
        self.app_context = app_context
        # Создаю пул соединений
        self.__postgres_service_pool: ConnectionPool = ConnectionPool(
            app_context['consul'],
            settings.consul['CONSUL_KEYS']['POSTGRES_SERVICE_NAME'])

    def get_connection(self, tenant: str):
        """
        Возвращает строку соединения с БД пользователя
        :param tenant: tenant пользователя
        :return:str строка соединения с БД
        """
        # Получить соединение с БД
        connection: ConsulService = self.__postgres_service_pool.get()
        # В соединении не хватает пользователя и пароля, получу их из консула
        db_user = self.app_context['consul'].get_value_by_key(settings.consul['CONSUL_KEYS']['POSTGRES_USER_KEY'])
        db_password = self.app_context['consul']\
            .get_value_by_key(settings.consul['CONSUL_KEYS']['POSTGRES_PASSWORD_KEY'])
        return f'postgres://{db_user}:{db_password}@{connection.host}:{connection.port}/{tenant}'

    async def get_pool(self, user: User):
        """
        Возвращает пул соединений с нужной БД (определяется по user)
        :param user: пользователь с заполненым tenant
        :return: пул соединений
        """
        tenant: str = user.tenant
        if tenant in self.__db_connection_pools:
            return self.__db_connection_pools[tenant]
        else:
            try:
                connect_str = self.get_connection(tenant)
                self.__db_connection_pools[tenant] = await asyncpg.create_pool(
                    connect_str, command_timeout=10)
            except Exception as ex:
                logging.warning("Не удалось установить соединение: %s" % traceback.format_exception_only(type(ex), ex))
                if tenant in self.__db_connection_pools:
                    logging.warning(f"Удалил соединение {self.__db_connection_pools.pop(tenant)}, оно не отвечает")
                raise DataBaseConnect(traceback.format_exception_only(type(ex), ex))
            return self.__db_connection_pools[tenant]

    def invalidation(self):
        if self.__postgres_service_pool:
            self.__postgres_service_pool.invalidation()
