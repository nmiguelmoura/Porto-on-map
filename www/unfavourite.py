from flask import request
from flask import session as login_session
import database_interaction

class Unfavourite():
    '''This module allows to delete a favourite from database.'''
    db = database_interaction.Database_interaction()

    def __init__(self):
        pass

    def launch(self):
        # Get marker id from post request.
        marker_id = request.form['marker_id']

        if (login_session['user_id']):
            # If user is logged in, delete favourite from database.
            self.db.delete_favourite(login_session['user_id'], marker_id)
            return marker_id

        return 'Please log in to store favourites'