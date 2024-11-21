folder_nesting: int = 20
version: str = "0.0.2-debug"


consul = {
    'CONSUL_KEYS': {
        "POSTGRES_SERVICE_NAME": "postgres_directories_service",
        "POSTGRES_USER_KEY": "postgres_directory_service/user",
        "POSTGRES_PASSWORD_KEY": "postgres_directory_service/password",
    },
    'DB_POOL_NAME': 'db_pool'
}

tests = {
    'select': 'localhost',
    'space_id': 19842,

    'localhost': {
        'url': 'http://127.0.0.1:8090',
        'access_token': False
    },

    'test_server': {
        'url': 'https://ittest.demo.doqa.ittest-team.ru',
        "email": "admin@test.com",
        "password": "123123123",
        'access_token': True
    }
}
