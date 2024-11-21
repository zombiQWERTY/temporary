from python_shared_packages.consul.ConsulService import ConsulService
from python_shared_packages.consul.ConsulDOQA import ConsulDOQA
import logging
import traceback


class ConnectionPool:

    def __init__(self, consul, name: str):
        self.pool: list = list()
        self.index = 0
        self.name = name
        self.consul: ConsulDOQA = consul
        self.auto_append()

    def append(self, connection: ConsulService):
        for service in self.pool:
            if service.id == connection.id:
                logging.debug("Не добавил в пул соединение %s, оно уже там есть" % connection)
                return
        self.pool.append(connection)
        logging.debug("Добавил в пул соединение %s" % connection)

    def remove(self, connection: ConsulService):
        for i in range(0, len(self.pool)):
            if self.pool[i].id == connection.id:
                logging.debug("Удалил соединение %s" % self.pool.pop(i))
                break

    def get(self):
        if len(self.pool) == 0:
            raise ValueError("Pool %s is empty" % self.name)
        connection = self.pool[self.index]
        self.index = (self.index + 1) % len(self.pool)
        # Перед тем как отдать, проверяет, что соедиенение исправно
        if self.ready(connection):
            return connection
        else:
            self.remove(connection)
            self.get()

    def invalidation(self):
        """
        Проверяет все соединения в пуле, если не отвечает, то выкидывает из пула
        """
        # Сначала проверить имеющиеся
        for service in self.pool:
            if not self.ready(service):
                logging.warning(f"Соединение {service} не пошло проверку, удаляю его")
                self.remove(service)

        # Теперь добавим новые
        self.auto_append()

    def auto_append(self):
        # Автоматически добавляет соединения указанного типа из консула в pool
        try:
            for service in self.consul.get_by_name(self.name):
                # Перед добавление надо его проверить, вдруг лежит
                if self.ready(service):
                    self.append(service)
                else:
                    logging.warning(f"Соединение {service} не добавил в пул, оно не прошло проверку")

        except Exception as ex:
            logging.warning("Ошибка при попытке найти БД в консуле %s" % traceback.format_exception_only(type(ex), ex))

    def ready(self, service: ConsulService):
        # Проверяет через консула доступно соединение или нет
        return self.consul.check(service)


