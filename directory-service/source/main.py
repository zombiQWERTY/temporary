import asyncio
from aiohttp import web
import logging
import os
from controllers.directory_get import directory_get
from controllers.directory_delete import directory_delete
from controllers.directory_list import directory_list
from controllers.directory_list_search import directory_list_search
from controllers.directory_create import directory_create
from controllers.directory_update import directory_update
from controllers.version_get import version_get
from aiohttp_swagger import *
from python_shared_packages.consul.ConsulDOQA import ConsulDOQA
from python_shared_packages.consul.ConsulService import ConsulService
import socket
from contextlib import closing
import argparse
import atexit
from timeloop import Timeloop
from datetime import timedelta
from python_shared_packages.connection_pool.postgres_client import PostgresClient

# Контекст для приложения
app_context: dict = dict()
# Watcher
watcher_loop = Timeloop()
# Список клиентов для проверки с помощью watcher
client_list = list()


async def init_app():
    """Initialize the application server."""
    handler_args = {'max_field_size': 256000}
    app = web.Application(handler_args=handler_args)
    # Configure service routes
    app.router.add_route('GET', r'/directories-api/space/{space_id:\d+}/dirs/{dir_id:\d+}', directory_get)
    app.router.add_route('GET', r'/directories-api/space/{space_id:\d+}/dirs/{dir_type:\D+}', directory_list)
    app.router.add_route('GET', r'/directories-api/space/{space_id:\d+}/search/{dir_type:\D+}', directory_list_search)
    app.router.add_route('POST', r'/directories-api/space/{space_id:\d+}/dirs', directory_create)
    app.router.add_route('DELETE', r'/directories-api/space/{space_id:\d+}/dirs/{dir_id:\d+}', directory_delete)
    app.router.add_route('PATCH', r'/directories-api/space/{space_id:\d+}/dirs/{dir_id:\d+}', directory_update)
    app.router.add_route('GET', r'/directories-api/version', version_get)
    setup_swagger(app, swagger_url="/directories-api/doc", ui_version=2)
    return app


def find_free_port():
    """Получает свободный порт, пока не используется.
    Его можно использовать чтобы сервис запускался на свободном порту"""
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(('', 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return s.getsockname()[1]


def consul_registration():
    host = app_context['consul_host']
    port = app_context['consul_port']
    app_port = app_context['app_port']
    app_context['consul'] = ConsulDOQA(host=host, port=port)
    service = ConsulService()
    service.host = os.uname()[1]
    service.port = app_port
    service.name = "directory-service"
    service.tags = "users-service",
    service.add_tcp_check(os.uname()[1], app_port)
    app_context['consul'].register_service(service)
    app_context['service'] = service


@watcher_loop.job(interval=timedelta(seconds=10))
def client_invalidation():
    """
    Запускает переодическую проверку пулов.
    В ходе работы проверяет имеющиеся в пуле соединения (если они упали, то удаляет)
    и добавляет новый из consul
    :return:
    """
    # Проверяю пул с postgres
    for client in client_list:
        client.invalidation()


@atexit.register
def program_exit():
    logging.warning('Завершение программы')
    if 'consul' in app_context:
        app_context['consul'].deregister_service(app_context['service'].id)
        logging.warning('Удалил из консула')
    exit()


if __name__ == "__main__":
    logging.basicConfig(format='%(asctime)s %(levelname)s: %(message)s',
                        level=os.getenv('LOG_LEVEL', 'DEBUG'))
    # Парсер для разбора командной строки
    parser = argparse.ArgumentParser(description='Directory-service')
    parser.add_argument('consul_host', metavar='consul_port', type=str,
                        help='Host with consul server. Example: consul.doqa.local')
    parser.add_argument('consul_port', metavar='consul_port', type=int,
                        help='Port for consul server. Example: 80')
    args = parser.parse_args()
    app_context['consul_host'] = args.consul_host
    app_context['consul_port'] = args.consul_port

    logging.info(f"Запущен с параметрами consul_host={app_context['consul_host']}, "
                 f"consul_port={app_context['consul_port']}")

    # Запуск приложения
    loop = asyncio.get_event_loop()
    application = loop.run_until_complete(init_app())
    app_context['app_port'] = 8090
    # После инициализации зарегистрируюсь в консуле
    consul_registration()
    logging.debug('Зарегистрировал в консуле')
    # Создание клиентов (у меня пока один, с postgres) их надо тут создать, т.к. передается консул
    postgres_client = PostgresClient()
    client_list.append(postgres_client)
    postgres_client.start(app_context)
    # Запуск автоматической проверки пулов
    watcher_loop.start()
    logging.info(f"Приложение запущено на порте {app_context['app_port']}")
    web.run_app(application, port=app_context['app_port'])
