from flask import redirect, url_for, make_response
from flask import session as login_session
import json
import httplib2


class Disconnect():
    '''Class that handles disconnection from a third-party login provider'''

    def __init__(self):
        pass

    def g_disconnect(self):
        # Disconnect google account

        # Only disconnect a connected user.
        credentials = login_session.get('credentials')
        if credentials is None:
            response = make_response(
                json.dumps('Current user not connected.'), 401)
            response.headers['Content-Type'] = 'application/json'
            return response
        access_token = login_session['credentials']
        url = 'https://accounts.google.com/o/oauth2/revoke?token=%s' % access_token
        h = httplib2.Http()
        result = h.request(url, 'GET')[0]
        if result['status'] != '200':
            # For whatever reason, the given token was invalid.
            response = make_response(
                json.dumps('Failed to revoke token for given user.'), 400)
            response.headers['Content-Type'] = 'application/json'
            return response

    def fb_disconnect(self):
        # Disconnect facebook account.
        facebook_id = login_session['facebook_id']
        # The access token must me included to successfully logout
        access_token = login_session['access_token']
        url = 'https://graph.facebook.com/%s/permissions?access_token=%s' % (
        facebook_id, access_token)
        h = httplib2.Http()
        result = h.request(url, 'DELETE')[1]
        return "you have been logged out"

    def launch(self):
        # Check if a registered user is logged in.
        if 'provider' in login_session:
            if login_session['provider'] == 'google':
                # Run if provider is google.
                self.g_disconnect()
                del login_session['gplus_id']
                del login_session['credentials']
            elif login_session['provider'] == 'facebook':
                # Run if provider is facebook.
                self.fb_disconnect()
                del login_session['facebook_id']

            # Delete login ingo.
            del login_session['user_id']
            del login_session['username']
            del login_session['email']
            del login_session['picture']
            del login_session['provider']

            return 'disconnected'
        else:
            # If no provider is registered in login_session,
            # user is not logged in.
            return 'not logged'
