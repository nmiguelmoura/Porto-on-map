from flask import Flask, render_template, jsonify, url_for
from flask import session as login_session


app = Flask(__name__)


@app.route('/')
def show():
    return 'teste'


@app.route('/markers/JSON/')
def return_markers():
    return 'All markers'


@app.route('/favourites/<int:user_id>/JSON/')
def return_user_favourites(user_id):
    return 'Favourites from user %s.' % user_id


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5000)