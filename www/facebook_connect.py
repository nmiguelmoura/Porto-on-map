import json

import httplib2
from flask import request, make_response, flash
from flask import session as login_session

import prefabs.login_output
import database_interaction


class Facebook_connect():
    '''Class that handles login through facebook account.'''

    db = database_interaction.Database_interaction()
    output = prefabs.login_output.Login_output()

    def __init(self):
        pass

    def launch(self):
        if request.args.get('state') != login_session['state']:
            response = make_response(json.dumps('Invalid state parameter.'), 401)
            response.headers['Content-Type'] = 'application/json'
            return response

        # Obtain authorization code
        access_token = request.data

        print "access token received %s " % access_token

        app_id = json.loads(open('fb_client_secrets.json', 'r').read())[
            'web']['app_id']
        app_secret = json.loads(
            open('fb_client_secrets.json', 'r').read())['web']['app_secret']
        url = 'https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=%s&client_secret=%s&fb_exchange_token=%s' % (
            app_id, app_secret, access_token)
        h = httplib2.Http()
        result = h.request(url, 'GET')[1]

        # Use token to get user info from API
        userinfo_url = "https://graph.facebook.com/v2.4/me"
        # strip expire tag from access token
        token = result.split("&")[0]

        url = 'https://graph.facebook.com/v2.4/me?%s&fields=name,id,email' % token
        h = httplib2.Http()
        result = h.request(url, 'GET')[1]
        # print "url sent for API access:%s"% url
        # print "API JSON result: %s" % result
        data = json.loads(result)
        login_session['provider'] = 'facebook'
        login_session['username'] = data["name"]
        login_session['email'] = data["email"]
        login_session['facebook_id'] = data["id"]

        # The token must be stored in the login_session in order to properly
        # logout, let's strip out the information before the equals
        # sign in our token
        stored_token = token.split("=")[1]
        login_session['access_token'] = stored_token

        # Get user picture
        url = 'https://graph.facebook.com/v2.4/me/picture?%s&redirect=0&height=200&width=200' % token
        h = httplib2.Http()
        result = h.request(url, 'GET')[1]
        data = json.loads(result)

        login_session['picture'] = data["data"]["url"]

        # see if user exists
        user_id = self.db.get_user_id(login_session['email'])
        if not user_id:
            user_id = self.db.create_user(login_session)
        login_session['user_id'] = user_id

        flash("Now logged in as %s" % login_session['username'])
        return self.output.get_output()