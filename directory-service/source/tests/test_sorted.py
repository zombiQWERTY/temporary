import requests
import settings

SPACE_ID = space_id = settings.tests['space_id']


def test_1_bad_custom_order(get_header, get_url):
    """ Пытается создать папку с неправильным customOrder, должна получить ошибку
    """
    base_url = get_url
    headers = get_header
    directory = {
        'name': 'Directory test unit',
        'parentId': 0,
        'customOrder': 10,
        'type': 'case'
    }
    # Создаю папку
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 400
    response_body = response.json()
    assert response_body['code'] == 40040, response_body


def test_2_custom_order_zero(get_header, get_url):
    """
    Создает папку на 0 уровне, которая должна быть первая в списке
    """
    base_url = get_url
    headers = get_header

    directory = {
        'name': 'Directory test unit',
        'parentId': 0,
        'customOrder': 0,
        'type': 'case'
    }
    # Создаю папку
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    delete_by_id(response.json()['directoryId'], base_url, headers)


def test_3_custom_order_after_delete(get_header, get_url):
    """
    Создает папку папки, удаляет несколько, проверяет сортировку после удаления
    """
    base_url = get_url
    headers = get_header
    directory = {
        'name': 'Directory test unit',
        'parentId': 0,
        'customOrder': 0,
        'type': 'case'
    }
    # Создаю папку
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    parent_id = response.json()['directoryId']

    # Создаю ей ребенка
    directory['customOrder'] = parent_id
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    child_id = response.json()['directoryId']

    # Создаю папку, которая должна стать самой первой
    directory['customOrder'] = 0
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    first = response.json()['directoryId']

    # Получаю список всех папок в list
    response = requests.get(base_url + f'/directories-api/space/{SPACE_ID}/dirs/case',
                            json=directory, headers=headers)
    assert response.status_code == 200
    sort_list = response.json()['directories']
    assert sort_list[0]['id'] == first
    assert sort_list[1]['id'] == parent_id
    assert sort_list[2]['id'] == child_id
    # Удаляю среднюю папку
    response = requests.delete(base_url + f"/directories-api/space/{SPACE_ID}/dirs/{parent_id}",
                               headers=headers)
    assert response.status_code == 200, response.status_code

    # Список должен перестроится и ребенок стать вторым
    response = requests.get(base_url + f'/directories-api/space/{SPACE_ID}/dirs/case',
                            json=directory, headers=headers)
    assert response.status_code == 200
    sort_list = response.json()['directories']
    assert sort_list[0]['id'] == first
    assert sort_list[1]['id'] == child_id

    # Остальных
    requests.delete(base_url + f"/directories-api/space/{SPACE_ID}/dirs/{first}",
                    headers=headers)
    requests.delete(base_url + f"/directories-api/space/{SPACE_ID}/dirs/{child_id}",
                    headers=headers)

    # Список пустой
    response = requests.get(base_url + f'/directories-api/space/{SPACE_ID}/dirs/case',
                            json=directory, headers=headers)
    assert response.status_code == 200
    resp_json = response.json()['directories']
    assert len(resp_json) == 0


def test_4_custom_order_after_delete(get_url, get_header):
    """
    Создает папку папки, меняет порядок сортировки
    """
    base_url = get_url
    headers = get_header
    directory = {
        'name': 'Directory test unit',
        'parentId': 0,
        'customOrder': 0,
        'type': 'case'
    }
    # Создаю папку
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    parent_id = response.json()['directoryId']

    # Создаю ей ребенка
    directory['customOrder'] = parent_id
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    child_id = response.json()['directoryId']

    # Создаю папку, которая должна стать самой первой
    directory['customOrder'] = 0
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    first = response.json()['directoryId']

    # Получаю список всех папок в list
    response = requests.get(base_url + f'/directories-api/space/{SPACE_ID}/dirs/case',
                            json=directory, headers=headers)
    assert response.status_code == 200
    sort_list = response.json()['directories']
    assert sort_list[0]['id'] == first
    assert sort_list[1]['id'] == parent_id
    assert sort_list[2]['id'] == child_id

    # Самую первую папку ставлю за последней
    response = requests.patch(base_url + f'/directories-api/space/{SPACE_ID}/dirs/{first}',
                              json={'customOrder': child_id}, headers=headers)
    assert response.status_code == 200

    # Получаю список всех папок в list
    response = requests.get(base_url + f'/directories-api/space/{SPACE_ID}/dirs/case',
                            json=directory, headers=headers)
    assert response.status_code == 200
    sort_list = response.json()['directories']
    assert sort_list[2]['id'] == first
    assert sort_list[0]['id'] == parent_id
    assert sort_list[1]['id'] == child_id
    delete_by_id(first, base_url, headers)
    delete_by_id(parent_id, base_url, headers)
    delete_by_id(child_id, base_url, headers)


def test_5_change_parent_and_sort(get_header, get_url):
    """
    Создает папку папки, меняет порядок сортировки
    """
    base_url = get_url
    headers = get_header
    # Создаю папку 1
    directory = {
        'name': 'Directory 1',
        'parentId': 0,
        'customOrder': 0,
        'type': 'case'
    }
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    folder1_id = response.json()['directoryId']

    # Создаю ей ребенка 1
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json={
                                 'name': 'Child 1',
                                 'parentId': folder1_id,
                                 'customOrder': 0,
                                 'type': 'case'
                             }, headers=headers)
    assert response.status_code == 200
    child_1_id = response.json()['directoryId']

    # Создаю ей ребенка 2
    directory['customOrder'] = 0
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json={
                                 'name': 'Child 2',
                                 'parentId': folder1_id,
                                 'customOrder': child_1_id,
                                 'type': 'case'
                             }, headers=headers)
    assert response.status_code == 200
    child_2_id = response.json()['directoryId']

    # Создаю папку 2
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json={
                                 'name': 'Directory 2',
                                 'parentId': 0,
                                 'customOrder': 0,
                                 'type': 'case'
                             }, headers=headers)
    assert response.status_code == 200
    folder2_id = response.json()['directoryId']

    # Перемещаю папку2 в папку 1, между 1 и 2-м ребенком
    response = requests.patch(base_url + f'/directories-api/space/{SPACE_ID}/dirs/{folder2_id}',
                              json={
                                  'parentId': folder1_id,
                                  'customOrder': child_1_id}, headers=headers)
    assert response.status_code == 200

    # Получаю список всех папок в папке1
    response = requests.get(base_url + f'/directories-api/space/{SPACE_ID}/dirs/case',
                            json=directory, headers=headers, params={'parentId': folder1_id})
    assert response.status_code == 200
    sort_list = response.json()['directories']
    print(sort_list)
    delete_by_id(folder1_id, base_url, headers)
    assert sort_list[0]['id'] == child_1_id
    assert sort_list[1]['id'] == folder2_id
    assert sort_list[2]['id'] == child_2_id


def test_6_update(get_header, get_url):
    """
    Создает 2 папки в разных space_id, пытается их связать через parent_id. Должен получить ошибку
    """
    base_url = get_url
    headers = get_header
    # Создаю папку 1
    directory = {
        'name': 'Directory 1',
        'parentId': 0,
        'customOrder': 0,
        'type': 'case'
    }
    response = requests.post(base_url + f'/directories-api/space/{SPACE_ID}/dirs',
                             json=directory, headers=headers)
    assert response.status_code == 200
    folder1_id = response.json()['directoryId']

    # Создаю папку 2
    space_id_2 = SPACE_ID + 1
    response = requests.post(base_url + f'/directories-api/space/{space_id_2}/dirs',
                             json={
                                 'name': 'Directory 2',
                                 'parentId': 0,
                                    'customOrder': 0,
                                    'type': 'case'
                             }, headers=headers)
    assert response.status_code == 200
    folder_2_id = response.json()['directoryId']

    # Папку 2 назначаю ребенком папки 1
    response = requests.post(base_url + f'/directories-api/space/{space_id_2}/dirs',
                             json={
                                 'parentId': folder1_id,
                             }, headers=headers)
    assert response.status_code == 400
    delete_by_id(folder1_id, base_url, headers)
    response = requests.delete(base_url + f"/directories-api/space/{space_id_2}/dirs/{folder_2_id}",
                               headers=headers)
    assert response.status_code == 200, response.status_code


def delete_by_id(directory_id: int, base_url, headers):
    response = requests.delete(base_url + f"/directories-api/space/{SPACE_ID}/dirs/{directory_id}",
                               headers=headers)
    assert response.status_code == 200, response.status_code
