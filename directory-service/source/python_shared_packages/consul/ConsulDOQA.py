import consul
from .ConsulService import ConsulService


class ConsulDOQA:
    """
    Класс содержит необходимую в проекте логику работы с консулом.
    """

    consul = None

    def __init__(self, host, port):
        if not self.consul:
            self.consul = consul.Consul(host=host, port=port)

    def get_by_name(self, name: str):
        """
        Возвращает список объектов сервис, если он находится в списке, иначе генерит исключение ValueError.
        ПОиск выполняет по имени, реестр игнорируется
        :param name: имя сервиса
        :return: список объектов Service
        """
        name = name.lower()
        service_dict: dict = self.consul.agent.services()
        result_list: list = list()
        for key in service_dict.keys():
            if service_dict[key]['Service'].lower() == name:
                result = ConsulService()
                result.load_from_dict(service_dict[key])
                result_list.append(result)
        if result_list:
            return result_list
        else:
            raise ValueError(f'Not found service with name {name}')

    def get_value_by_key(self, key: str):
        result = self.consul.kv.get(key)
        if not result[1]:
            raise ValueError(f'Not found key with name {key}')
        return result[1]['Value'].decode('utf-8')

    def get_key_list(self, key_prefix: str):
        result = self.consul.kv.get(key_prefix, recurse=True, keys=True)
        if not result[1]:
            raise ValueError(f'Not found keys with prefix {key_prefix}')
        return result[1]

    def save_value(self, key: str, value):
        self.consul.kv.put(key, str(value))

    def delete_value(self, key: str):
        self.consul.kv.delete(key)

    def register_service(self, new_service: ConsulService):
        self.consul.agent.service.register(name=new_service.name, service_id=new_service.id, address=new_service.host,
                                           port=new_service.port, check=new_service.check, tags=new_service.tags)

    def deregister_service(self, uuid: str):
        self.consul.agent.service.deregister(uuid)

    def check(self, service: ConsulService):
        index, nodes = self.consul.health.checks(service=service.name)
        for node in nodes:
            if node['ServiceID'] == service.id and node['Status'] == 'passing':
                return True
        return False




