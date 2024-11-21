import requests
import settings


def test_1_delete_directory(get_url, get_header):
    base_url = get_url
    space_id = settings.tests['space_id']
    headers = get_header

    directory = {
        'name': 'Directory test unit',
        'parentId': 0,
        'customOrder': 0,
        'type': 'run'
    }
    # Создаю папку
    response = requests.post(base_url + f'/directories-api/space/{space_id}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    response_body = response.json()
    assert response_body['directoryId'] > 0
    create_id = response_body['directoryId']

    # Создаю вторую папку, ее ребенка
    directory['parentId'] = create_id
    response = requests.post(base_url + f'/directories-api/space/{space_id}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    response_body = response.json()
    assert response_body['directoryId'] > 0
    create_id2 = response_body['directoryId']

    # Создаю 3-ю папку
    directory['parentId'] = create_id2
    response = requests.post(base_url + f'/directories-api/space/{space_id}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200

    # Удаляю папку родителя
    response = requests.delete(base_url + f'/directories-api/space/{space_id}/dirs/{create_id}',
                               headers=headers)
    assert response.status_code == 200, response.status_code
    response_body: dict = response.json()
    deleted = response_body.get('deleted', 0)
    assert deleted == 3, f'Must be more 3, have {deleted}'
