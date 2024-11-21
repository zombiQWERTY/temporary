from constants.EssencesType import EssencesType


error_messages = {
    40010: "Invalid directory type",
    40020: "Bad directory type. Can type only: %s" % [essences.name for essences in EssencesType],
    40030: "Invalid directory format",
    40040: "Invalid sorted parameters",
    40050: "Invalid parent_id. Check parent_id, space_id, type",
    40410: "Directory not found",
    500: 'Internal Server Error',
    50010: 'Data base connection error',
    50020: 'Data base error'
}


def get_error_message_by_code(code: int):
    default_message = "Have not message for this error"
    return error_messages.get(code, default_message)
