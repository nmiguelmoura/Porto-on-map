from flask import request, jsonify
from flask import session as login_session
import database_interaction


class Add_marker():
    db = database_interaction.Database_interaction()

    def __init__(self):
        pass

    def launch(self):
        title = request.form['title']
        type = request.form['type']
        latitude = float(request.form['latitude'])
        longitude = float(request.form['longitude'])
        description = request.form['description']

        if login_session['user_id']:
            new_marker = self.db.add_marker(title, type, latitude, longitude, description,
                               login_session['user_id'])

            return jsonify(Marker=new_marker.serialize)

        return 'failed'
