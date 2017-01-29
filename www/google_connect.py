import json

import httplib2
import requests
from flask import request, flash, make_response, jsonify
from flask import session as login_session
from oauth2client.client import AccessTokenCredentials
from oauth2client.client import FlowExchangeError
from oauth2client.client import flow_from_clientsecrets

import prefabs.login_output
import database_interaction


class Google_connect():
    '''Class that handles login through google account.'''
    db = database_interaction.Database_interaction()
    output = prefabs.login_output.Login_output()
    CLIENT_ID = json.loads(open('g_client_secrets.json', 'r').read())['web'][
        'client_id']

    def __init__(self):
        pass

    def launch(self):
        # Validate state token
        if request.args.get('state') != login_session['state']:
            response = make_response(json.dumps('Invalid state parameter.'),
                                     401)
            response.headers['Content-Type'] = 'application/json'
            return response
        # Obtain authorization code
        code = request.data

        try:
            # Upgrade the authorization code into a credentials object
            oauth_flow = flow_from_clientsecrets('g_client_secrets.json',
                                                 scope='')
            oauth_flow.redirect_uri = 'postmessage'
            credentials = oauth_flow.step2_exchange(code)
        except FlowExchangeError:
            response = make_response(
                json.dumps('Failed to upgrade the authorization code.'), 401)
            response.headers['Content-Type'] = 'application/json'
            return response

        # Check that the access token is valid.
        access_token = credentials.access_token
        url = ('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s'
               % access_token)
        h = httplib2.Http()
        result = json.loads(h.request(url, 'GET')[1])
        # If there was an error in the access token info, abort.
        if result.get('error') is not None:
            response = make_response(json.dumps(result.get('error')), 500)
            response.headers['Content-Type'] = 'application/json'
            return response

        # Verify that the access token is used for the intended user.
        gplus_id = credentials.id_token['sub']
        if result['user_id'] != gplus_id:
            response = make_response(
                json.dumps("Token's user ID doesn't match given user ID."), 401)
            response.headers['Content-Type'] = 'application/json'
            return response

        # Verify that the access token is valid for this app.
        if result['issued_to'] != self.CLIENT_ID:
            response = make_response(
                json.dumps("Token's client ID does not match app's."), 401)
            print "Token's client ID does not match app's."
            response.headers['Content-Type'] = 'application/json'
            return response

        stored_credentials = login_session.get('credentials')
        stored_gplus_id = login_session.get('gplus_id')
        if stored_credentials is not None and gplus_id == stored_gplus_id:
            response = make_response(
                json.dumps('Current user is already connected.'),
                200)
            response.headers['Content-Type'] = 'application/json'
            return response

        # store only the access_token
        login_session['credentials'] = credentials.access_token

        # return credential object
        credentials = AccessTokenCredentials(login_session['credentials'],
                                             'user-agent-value')

        login_session['gplus_id'] = gplus_id

        # Get user info
        userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
        params = {'access_token': credentials.access_token, 'alt': 'json'}
        answer = requests.get(userinfo_url, params=params)

        data = answer.json()

        login_session['provider'] = 'google'
        login_session['username'] = data['name']
        login_session['picture'] = data['picture']
        login_session['email'] = data['email']

        login_session['user_id'] = self.db.create_user(login_session)

        flash("You are now logged in as %s" % login_session['username'])
        # return self.output.get_output()
        return jsonify({'html': self.output.get_output(),
                        'user_id': login_session['user_id']})
