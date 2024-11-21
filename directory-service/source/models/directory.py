import datetime
from constants.EssencesType import EssencesType


class Directory:
    """
    Класс для хранение инф о папке
    """

    def __init__(self):
        self.directory_id: int = 0
        self.name: str = ""
        self.parent_id: int = 0
        self.author_id: int = 0
        self.create_date: datetime = datetime.datetime.now()
        self.update_date: datetime = self.create_date
        self.custom_order_id: int = 0
        self.is_delete: bool = False
        self.essences_type: EssencesType = EssencesType(1)
        self.is_parent: bool = False
        self.space_id: int = 0

    def deserialize(self, records: dict):
        """
        Заполняет класс используя записи полученных из БД
        :param records: запись из БД
        :return: ничего. модифицирует переменные класса
        """
        # Первым с списке всегда идет папка
        for key, value in records.items():
            # Это нужно, т.к. от БД не возращается camelCase
            lower_key = key.lower()
            if lower_key == 'id':
                self.directory_id = value
            elif lower_key == 'name':
                self.name = value
            elif lower_key == 'parentid':
                self.parent_id = value
            elif lower_key == 'authorid':
                self.author_id = value
            elif lower_key == 'createdate':
                self.create_date = value
            elif lower_key == 'updatedate':
                self.update_date = value
            elif lower_key == 'customorder':
                self.custom_order_id = value
            elif lower_key == 'isdelete':
                self.is_delete = value
            elif lower_key == 'typeid':
                self.essences_type = EssencesType(value)
            elif lower_key == 'spaceid':
                self.space_id = value
            elif lower_key == 'is_parent':
                self.is_parent = value

    def serialize(self, short=False):
        """
        Метод возвращает dict для объекта, чтобы потом его преобразовать в json
        :return: dict
        """
        result = dict()
        result['id'] = self.directory_id
        result['name'] = self.name
        result['parentId'] = self.parent_id
        result['authorId'] = self.author_id
        result['createDate'] = self.create_date.isoformat()
        result['updateDate'] = self.update_date.isoformat()
        result['customOrder'] = self.custom_order_id
        result['type'] = self.essences_type.name
        result['isParent'] = self.is_parent
        result['spaceId'] = self.space_id
        if not short:
            # Пока не используется, но в будущем вероятно придумает применение
            pass
        return result

    def copy(self):
        """
        Создает копию папки, копирует все поля, только поле update текущая дата
        :return: папка
        """
        new_directory = Directory()
        new_directory.directory_id = self.directory_id
        new_directory.name = self.name
        new_directory.parent_id = self.parent_id
        new_directory.author_id = self.author_id
        new_directory.create_date = self.create_date
        new_directory.update_date = datetime.datetime.now()
        new_directory.custom_order_id = self.custom_order_id
        new_directory.is_delete = self.is_delete
        new_directory.essences_type = self.essences_type
        new_directory.is_parent = self.is_parent
        new_directory.space_id = self.space_id
        return new_directory

    def __str__(self):
        return f"id={self.directory_id}, name={self.name}, parent_id={self.parent_id}, author_id={self.author_id}, " \
               f"create_date={self.create_date}, update_date={self.update_date}, " \
               f"custom_order_id={self.custom_order_id}, is_delete={self.is_delete}, type={self.essences_type}," \
               f"is_parent={self.is_parent}, space_id={self.space_id}"
