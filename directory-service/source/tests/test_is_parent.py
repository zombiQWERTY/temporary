import requests
import settings

SPACE_ID = space_id = settings.tests['space_id']


def test_1_is_parent(get_url, get_header):
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
    parent_id = response_body['directoryId']

    # Создаю вторую папку, ее ребенка
    directory['parentId'] = parent_id
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    response_body = response.json()
    assert response_body['directoryId'] > 0
    child_id = response_body['directoryId']

    # Проверяю, что у первой установлен родитель
    response = requests.get(base_url + f'/directories-api/space/{SPACE_ID}/dirs/{parent_id}',
                            headers=headers)
    assert response.status_code == 200
    parent_body = response.json()
    assert parent_body['isParent'] is True, f'Need isParent=true, have={parent_body}'

    # Удаляю ребенка
    response = requests.delete(base_url + f'/directories-api/space/{SPACE_ID}/dirs/{child_id}',
                               headers=headers)
    assert response.status_code == 200, response.status_code
    response_body: dict = response.json()
    deleted = response_body.get('deleted', 0)
    assert deleted == 1, f'Must be more 1, have {deleted}'

    # Проверяю, что у родителя пропал isParent
    response = requests.get(base_url + f'/directories-api/space/{SPACE_ID}/dirs/{parent_id}',
                            headers=headers)
    assert response.status_code == 200
    parent_body = response.json()
    assert parent_body['isParent'] is False, f'Need isParent=false, have={parent_body}'

    # Удаляю родителя
    response = requests.delete(base_url + f'/directories-api/space/{SPACE_ID}/dirs/{parent_id}',
                               headers=headers)
    assert response.status_code == 200, response.status_code
