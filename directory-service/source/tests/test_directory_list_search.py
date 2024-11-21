import requests
import settings

SPACE_ID = space_id = settings.tests['space_id']


def test_1(get_url, get_header):
    """Поиск папки по новому адресу"""
    response = requests.get(get_url + f'/directories-api/space/{SPACE_ID}/search/case',
                            params={"name": "Alexey"}, headers=get_header)
    assert response.status_code == 200


def test_2(get_url, get_header):
    """Поиск папки по новому адресу"""
    response = requests.get(get_url + f'/directories-api/space/{SPACE_ID}/search/cases',
                            params={"name": "Alexey"}, headers=get_header)
    assert response.status_code == 400
