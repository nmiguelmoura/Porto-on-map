from flask import request
from flask import session as login_session
import database_interaction

class Favourite():
    '''This module allows to store a favourite in database.'''

    db = database_interaction.Database_interaction()

    def __init__(self):
        pass

    def launch(self):
        # Get marker id from post request.
        marker_id = request.form['marker_id']

        if (login_session['user_id']):
            # If user is logged in, store favourite from database.
            self.db.store_favourite(login_session['user_id'], marker_id)
            return marker_id

        return 'Please log in to store favourites'