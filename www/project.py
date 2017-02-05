import random
import string

from flask import Flask, render_template, jsonify
from flask import session as login_session

import disconnect
import facebook_connect
import google_connect
import database_interaction
import add_marker
import favourite
import unfavourite

app = Flask(__name__)

db = database_interaction.Database_interaction()
g_connect = google_connect.Google_connect()
fb_connect = facebook_connect.Facebook_connect()
g_fb_disconnect_page = disconnect.Disconnect()
marker = add_marker.Add_marker()
fav = favourite.Favourite()
unfav = unfavourite.Unfavourite()

'''This module has all the routers available, with support to JSON API.'''

@app.route('/')
def show():
    # Generate random code to validate login.
    state = ''.join(
        random.choice(string.ascii_uppercase + string.digits) for x in
        xrange(32))
    login_session['state'] = state
    return render_template('index.html', STATE=state)


@app.route('/markers/JSON/')
def return_markers():
    # Queries database for all markers and responds in JSON format.
    markers = db.query_all_markers()
    return jsonify(Marker=[m.serialize for m in markers])


@app.route('/favourites/<int:user_id>/JSON/')
def return_user_favourites(user_id):
    # Queries database form user favourites and responds in JSON format.
    favourites = db.query_user_favourites(user_id)
    return jsonify(Favourite=[f.serialize for f in favourites])

@app.route('/add', methods=['POST'])
def add_marker():
    # Add a new marker to database.
    return marker.launch()

@app.route('/fav', methods=['POST'])
def favourite_handler():
    # Mark local as favourite in database.
    return fav.launch()

@app.route('/unfav', methods=['POST'])
def unfavourite_handler():
    # Remove favourite from database.
    return unfav.launch()

@app.route('/gconnect', methods=['POST'])
def gconnect():
    # Allow login with google plus.
    return g_connect.launch()

@app.route('/fbconnect', methods=['POST'])
def fbconnect():
    # Allow login with facebook.
    return fb_connect.launch()

@app.route('/disconnect/')
def disconnect_page():
    # Disconnect from google or facebook.
    return g_fb_disconnect_page.launch()


if __name__ == '__main__':
    app.secret_key = "secret_key"
    app.debug = True
    app.run(host='0.0.0.0', port=5000)
