from flask import Flask, render_template, jsonify, url_for
from flask import session as login_session
import prefabs.database_interaction


app = Flask(__name__)

db = prefabs.database_interaction.Database_interaction()


@app.route('/')
def show():
    return render_template('index.html')


@app.route('/markers/JSON/')
def return_markers():
    markers = db.query_all_markers()
    return jsonify(Marker=[m.serialize for m in markers])


@app.route('/favourites/<int:user_id>/JSON/')
def return_user_favourites(user_id):
    favourites = db.query_user_favourites(user_id)
    return jsonify(Favourite=[f.serialize for f in favourites])


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5000)