from constants.EssencesType import EssencesType


# Предварительные константы, для использования в валидации
smallId = {
    'type': 'integer',
    'min': 0,
    'max': 2147483647
}

ess_names = {
    'type': 'string',
    'allowed': [essences.name for essences in EssencesType],
    'required': True
}

# Схема для валидации папок
directory_schema = {
    # Должен быть больше 5
    'name': {
        'type': 'string',
        'minlength': 4,
        'maxlength': 255,
        'required': True
    },
    'parentId': smallId,

    'type': ess_names,
    'customOrder': smallId
}

# Схема для валидации папок
directory_update_schema = {
    # Должен быть больше 5
    'name': {
        'type': 'string',
        'minlength': 4,
        'maxlength': 255
    },

    # Целое число от -32766 до 32766
    'customOrder': smallId,
    'parentId': smallId
}



