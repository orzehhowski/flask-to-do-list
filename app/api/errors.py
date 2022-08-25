

def error_response(code, message=None):
    response = {
        'error_code': code, 
        'error': message or 'Ooops, something went wrong!'
        }
    return response, code


def bad_request(mess):
    return error_response(400, mess)