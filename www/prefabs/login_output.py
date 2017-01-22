from flask import session as login_session

class Login_output:
    '''Class that handles the output after successful login with third-party
    provider.'''

    def __init__(self):
        pass

    def get_output(self):
        # Generate and return output with user info (name and picture).
        output = ''
        output += '<h1>Welcome, '
        output += login_session['username']
        output += '!</h1>'
        output += '<img src="'
        output += login_session['picture']
        output += ' "> '
        output += '<p>Redirecting to restaurants page...</p>'
        return output