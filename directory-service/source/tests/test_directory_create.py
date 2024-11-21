import requests
import settings

SPACE_ID = space_id = settings.tests['space_id']


def test_1_directory_create(get_url, get_header):
    base_url = get_url
    headers = get_header
    directory = {
        'name': 'Directory test unit',
        'parentId': 0,
        'customOrder': 0,
        'type': 'run'
    }
    # Создаю папку
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    response_body = response.json()
    assert response_body['directoryId'] > 0
    create_id = response_body['directoryId']
    # Получаю папку
    response = requests.get(base_url + f'/directories-api/space/{SPACE_ID}/dirs/{create_id}',
                            headers=headers)
    assert response.status_code == 200
    response_body = response.json()
    assert_dict(directory, response_body)
    # И проверб spaceId, т.к. был такой баг
    assert response_body['spaceId'] == SPACE_ID
    # print(response_body)
    # Удаляю папку
    response = requests.delete(base_url + f'/directories-api/space/{SPACE_ID}/dirs/{create_id}',
                               headers=headers)
    assert response.status_code == 200
    response_body: dict = response.json()
    deleted = response_body.get('deleted', 0)
    assert deleted > 0, f'Must be more zero, have {deleted}'


def test_2_directory_create(get_url, get_header):
    base_url = get_url
    headers = get_header
    directory = {
        'customOrder': 0,
        'type': 'run'
    }
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 400, f'Have code {response.status_code}, need 400. ' \
                                        f'Service response: {response.text}'


def test_3_directory_create(get_url, get_header):
    base_url = get_url
    headers = get_header
    directory = {
        'name': 'Directory test unit',
        'parentId': 0,
        'customOrder': 0
    }
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 400, f'Have code {response.status_code}, need 400. ' \
                                        f'Service response: {response.text}'


def test_4_directory_create(get_url, get_header):
    base_url = get_url
    headers = get_header
    directory = {
        'name': 'Dir',
        'customOrder': 0,
        'type': 'run'
    }
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 400, f'Have code {response.status_code}, need 400. ' \
                                        f'Service response: {response.text}'


def test_5_directory_create(get_url, get_header):
    # Пытается создать папку c неправильным типом
    base_url = get_url
    headers = get_header
    directory = {
        'name': 'Dir for test',
        'parentId': 0,
        'customOrder': 0,
        'type': 'runs'
    }
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 400, f'Have code {response.status_code}, need 400. ' \
                                        f'Service response: {response.text}'


def assert_dict(good: dict, bad: dict):
    for key in good.keys():
        assert good[key] == bad[key], f'Must be equal value for {key}. Good={good[key]}, bad={bad[key]}'


def test_6_directory_create(get_url, get_header):
    """Пытается создать папку у которой разные типы родителя и ребенка"""
    base_url = get_url
    headers = get_header
    directory = {
        'name': 'Directory test unit',
        'parentId': 0,
        'customOrder': 0,
        'type': 'run'
    }
    # Создаю папку родителя
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    response_body = response.json()
    assert response_body['directoryId'] > 0
    create_id = response_body['directoryId']
    # Создаю папку ребенка
    directory['type'] = 'case'
    directory['parentId'] = create_id
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 400
    response = requests.delete(base_url + f'/directories-api/space/{SPACE_ID}/dirs/{create_id}',
                               headers=headers)
    assert response.status_code == 200


def test_7_directory_create(get_url, get_header):
    """Пытается создать папку у которой разные space_id родителя и ребенка"""
    base_url = get_url
    headers = get_header
    directory = {
        'name': 'Directory test unit',
        'parentId': 0,
        'customOrder': 0,
        'type': 'run'
    }
    # Создаю папку родителя
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    response_body = response.json()
    assert response_body['directoryId'] > 0
    create_id = response_body['directoryId']
    # Создаю папку ребенка
    directory['parentId'] = create_id
    bad_space_id = SPACE_ID + 1
    response = requests.post(base_url + f'/directories-api/space/{bad_space_id}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 400
    response = requests.delete(base_url + f'/directories-api/space/{SPACE_ID}/dirs/{create_id}',
                               headers=headers)
    assert response.status_code == 200
