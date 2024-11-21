from settings import tests
import requests
import pytest


@pytest.fixture()
def get_url():
    conf = tests['select']
    return tests[conf]['url']


@pytest.fixture()
def get_header():
    conf = tests['select']
    if tests[conf]['access_token']:
        headers = get_headers_for_server(tests[conf]['url'], tests[conf]['email'], tests[conf]['password'])
    else:
        headers = get_headers_for_local()
    return headers


def get_headers_for_local():
    return {
        'X-Forwarded-Tenant': 'test',
        'X-Forwarded-Permissions': '"[{\"id\":1,\"name\":\"CanCreateNewUsers\",\"essence\":\"\"},'
                                   '{\"id\":2,\"name\":\"CanEditAllUsers\",\"essence\":\"\"}]"',
        'Content-Type': 'application/json; charset utf-8'
    }


def get_headers_for_server(url, email, password):
    """
    Проводит авторизацию и возвращает assecc token
    :param url: ссылка
    :param email: почта
    :param password: пароль
    :return: набор заголовков
    """
    response = requests.post(url + '/users-api/auth/login', json={
        "email": email,
        "password": password
    }, headers={
        'Content-Type': 'application/json; charset utf-8'
    })
    access_token = response.json()['tokens']['accessToken']
    return {
        'Content-Type': 'application/json; charset utf-8',
        'authorization': 'Bearer ' + access_token
    }
