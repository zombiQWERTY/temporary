import requests
from settings import version


def test_1_version_get(get_header, get_url):
    response = requests.get(get_url + f'/directories-api/version', headers=get_header)
    assert response.status_code == 200
    response_body = response.json()
    assert response_body['version'] == version
