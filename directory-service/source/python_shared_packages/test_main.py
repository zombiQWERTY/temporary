from unittest import TestCase
from python_shared_packages.consul.ConsulDOQA import ConsulDOQA
from python_shared_packages.consul.ConsulService import ConsulService
from consul import Check


class Test(TestCase):
    host = 'consul.doqa.local'
    port = 80
    consul = None

    def setUp(self):
        self.consul = ConsulDOQA(host=self.host, port=self.port)

    def test_get_by_name_404(self):
        try:
            self.consul.get_by_name("not-found")
        except ValueError as ex:
            self.assertEqual(str(ex), 'Not found service with name not-found')
        else:
            self.fail("Должен был не найти сервис с именем not-found")

    def test_get_by_name(self):
        result = self.consul.get_by_name("postgres_projects_service")
        self.assertEqual(len(result), 1)
        self.assertEqual(str(result[0]),
            "[id=postgres_projects_service-0, service=postgres_projects_service, host=localhost, port=5435]")

    def test_get_key_404(self):
        key = '404'
        try:
            self.consul.get_value_by_key(key)
        except ValueError as ex:
            self.assertEqual(str(ex), f'Not found key with name {key}')
        else:
            self.fail("Must be not found")

    def test_get_key_list(self):
        key = '404'
        try:
            s = self.consul.get_key_list(key)
        except ValueError as ex:
            self.assertEqual(str(ex), f'Not found keys with prefix {key}')
        else:
            self.fail("Must be not found")

    def test_put_value(self):
        self.consul.save_value("test", 1)
        self.consul.save_value("test2", 2)
        s = self.consul.get_key_list("test")
        self.assertEqual(s, ["test", "test2"])
        self.consul.delete_value("test")
        self.consul.delete_value("test2")

    def test_delete_value_404(self):
        # Он хочет удалить ключ которого нет, но с ошибкой не падает
        self.consul.delete_value("test404")

    def test_create_service(self):

        try:
            self.consul.get_by_name("test")
        except ValueError as ex:
            self.assertEqual(str(ex), 'Not found service with name test')
        else:
            self.fail("Должен был не найти сервис с именем test")

        service = ConsulService()
        service.host = "consul.doqa.local"
        service.port = 80
        service.name = "test"
        service.tags = ['test1', 'test2']
        service.check = Check.tcp(service.host, service.port, 10)
        self.consul.register_service(service)

        service = ConsulService()
        service.host = "consul.doqa.local"
        service.port = 81
        service.name = "test"
        service.tags = ['test1', 'test2']
        service.check = Check.tcp(service.host, service.port, 10)
        self.consul.register_service(service)

        service = ConsulService()
        service.host = "consul.doqa.local"
        service.port = 82
        service.name = "test"
        service.tags = ['test1', 'test2']
        service.check = Check.tcp(service.host, service.port, 10)
        self.consul.register_service(service)

        # После регистрации получить его имя
        result = self.consul.get_by_name("test")
        for s in result:
            print("После регистрации: ", s)

        # Удаляю все что test
        result = self.consul.get_by_name("test")
        for service in result:
            self.consul.deregister_service(service.id)
        # После удаления у нас не должно остаться с именем тест
        try:
            self.consul.get_by_name("test")
        except ValueError as ex:
            self.assertEqual(str(ex), 'Not found service with name test')
        else:
            self.fail("Должен был не найти сервис с именем test")

    def test_get_key_list1(self):
        key = 'postgres_users_service'
        s = self.consul.get_key_list(key)
        print(s)




