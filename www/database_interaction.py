# -*- coding: utf-8 -*-
from flask import session as login_session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database_setup import Base, User, Marker, Favourite


class Database_interaction:
    '''Class used to populate database on setup.'''

    engine = create_engine('sqlite:///mapapp.db')
    Base.metadata.bind = engine
    DBSession = sessionmaker(bind=engine)
    session = DBSession()

    def query_user_by_id(self, id):
        return self.session.query(User) \
            .filter_by(id=id) \
            .one()

    def query_all_markers(self):
        return self.session.query(Marker) \
            .all()

    def query_user_favourites(self, user_id):
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
