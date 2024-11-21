import uuid
import consul


class ConsulService:
    """
    Класс для хранения информацию о сервисе, получаемой от консула
    """

    def __init__(self):
        """
        При инициализации только заполняет uuid, остальное
        надо заполнить через метод load_from_dict
        """
        self.id = str(uuid.uuid4())
        self.service = None
        self.host = None
        self.port = 0
        self.check = None
        self.tags = None
        self.name = None
        self.ready = False

    def load_from_dict(self, dict_consul: dict):
        """
        Заполняет класс словарем из консула
        :param dict_consul: данные от консула, словарь
        :return: модифицирует внутренние переменные класса
        """
        self.id = dict_consul['ID']
        self.name = dict_consul['Service']
        self.port = dict_consul['Port']
        self.host = dict_consul['Address']
        self.tags = dict_consul['Tags']

    def __str__(self):
        return f"[id={self.id}, service={self.name}, host={self.host}, port={self.port}, tags={self.tags}]"

    def add_tcp_check(self, host, port, ttl=10):
        self.check = consul.Check.tcp(host, port, ttl)

