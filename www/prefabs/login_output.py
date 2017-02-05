from flask import session as login_session

class Login_output:
    '''Class that handles the output after successful login with third-party
    provider.'''

    def __init__(self):
        pass

    def get_output(self):
        # Generate and return output with user info (name and picture).
        output = ''
        output += '<p>Welcome, '
        output += login_session['username']
        output += '!</p>'
        return output