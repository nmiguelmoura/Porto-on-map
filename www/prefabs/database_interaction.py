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

    # def add_users(self):
    #     for u in self.users:
    #         self.session.add(User(
    #             name=u['name'],
    #             email=u['email'],
    #             picture=u['picture']
    #         ))
    #     self.session.commit()
    #
    #
    # def add_markers(self):
    #     for m in self.markers:
    #         self.session.add(Marker(
    #             latitude=m['latitude'],
    #             longitude=m['longitude'],
    #             description=m['description'],
    #             user_id=m['user_id']
    #         ))
    #     self.session.commit()