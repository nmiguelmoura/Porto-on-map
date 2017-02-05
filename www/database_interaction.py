# -*- coding: utf-8 -*-
from flask import session as login_session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database_setup import Base, User, Marker, Favourite

class Database_interaction:
    '''This module manages all connections with database.'''

    engine = create_engine('sqlite:///mapapp.db')
    Base.metadata.bind = engine
    DBSession = sessionmaker(bind=engine)
    session = DBSession()

    def query_user_by_id(self, id):
        # Return user with given id from database.
        return self.session.query(User) \
            .filter_by(id=id) \
            .one()

    def query_all_markers(self):
        # Return all markers in database.
        return self.session.query(Marker) \
            .all()

    def add_marker(self, title, type, latitude, longitude, description, user_id):
        # Add a new marker to database.
        new_marker = Marker(
            title=title,
            type=type,
            latitude=latitude,
            longitude=longitude,
            description=description,
            user_id=user_id
        )
        self.session.add(new_marker)
        self.session.commit()
        return new_marker

    def delete_favourite(self, user_id, marker_id):
        # Delete a favourite from database.
        fav = self.session.query(Favourite) \
            .filter_by(user_id=user_id, marker_id=marker_id) \
            .one()

        self.session.delete(fav)
        self.session.commit()
        return 'Unfavourited marker %s' % marker_id

    def store_favourite(self, user_id, marker_id):
        # Add a favourite to database.
        new_favourite = Favourite(
            user_id=user_id,
            marker_id=marker_id
        )

        self.session.add(new_favourite)
        self.session.commit()
        return new_favourite

    def query_user_favourites(self, user_id):
        # Return all users favourite locations.
        return self.session.query(Favourite) \
            .filter_by(user_id=user_id) \
            .all()

    def get_user_info(self, user_id):
        # Get user info from User table that matches passed id.
        user = self.session.query(User).filter_by(id=user_id).one()
        return user

    def get_user_id(self, email):
        try:
            # Try to get user info from user with email passed
            user = self.session.query(User).filter_by(email=email).one()
            return user.id
        except:
            return None

    def create_user(self, login_session):
        # Try to create a new user.

        # Check if email already exists in DB.
        existing_user = self.get_user_id(login_session['email'])

        if existing_user:
            # If email exists, do not save new one.
            print u'Current user already registered!'
            return existing_user

        # If email does not exist, save a new user.
        new_user = User(name=login_session['username'],
                        email=login_session['email'],
                        picture=login_session['picture'])
        self.session.add(new_user)
        self.session.commit()
        return self.get_user_id(login_session['email'])
