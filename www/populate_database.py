# -*- coding: utf-8 -*-
from flask import session as login_session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database_setup import Base, User, Marker, Favourite

class Populate_database:
    '''Class used to populate database on setup.'''

    engine = create_engine('sqlite:///mapapp.db')
    Base.metadata.bind = engine
    DBSession = sessionmaker(bind=engine)
    session = DBSession()

    users = [
        {
            'name': 'me',
            'email': 'me@email.com',
            'picture': 'http://placekitten.com/100/100'
         }
    ]

    markers = [
        {
            'title': 'Place to go eat something',
            'latitude': 41.1562453,
            'longitude': -8.6613685,
            'description': 'My city',
            'user_id': 1
        }
    ]

    favourites = [
        {
            "user_id": 1,
            "marker_id": 1
        }
    ]

    def add_users(self):
        for u in self.users:
            self.session.add(User(
                name=u['name'],
                email=u['email'],
                picture=u['picture']
            ))
        self.session.commit()


    def add_markers(self):
        for m in self.markers:
            self.session.add(Marker(
                title=m['title'],
                latitude=m['latitude'],
                longitude=m['longitude'],
                description=m['description'],
                user_id=m['user_id']
            ))
        self.session.commit()

pop = Populate_database()
pop.add_users()
pop.add_markers()