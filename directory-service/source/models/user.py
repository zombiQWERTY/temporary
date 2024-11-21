class User:
    """
    Инф о пользователе, нужна для определения с какой БД работать
    """

    def __init__(self):
        self.user_id: int = 0
        self.permission: str = ""
        self.tenant: str = ""

    def load_from_headers(self, headers):
        """
        Загружает в класс информацию из заголовков сообщения
        :param headers: заголовки
        :return: ничего, модифицирует переменные класса
        """
        u_id: str = headers.getone('X-Forwarded-User', "0")
        if u_id.isnumeric():
            self.user_id = int(u_id)
        self.permission = headers.getone('X-Forwarded-Permissions', "")
        self.tenant = headers.getone('X-Forwarded-Tenant', "")
