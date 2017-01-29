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
            'name': 'Nuno Machado',
            'email': 'nmiguelmoura@gmail.com',
            'picture': 'https://scontent.xx.fbcdn.net/v/t1.0-1/c0.16.200.200/p200x200/1378145_638433192868456_594681303_n.jpg?oh=7d242c97f8f2c8a8bd4ab21ab47ba4d9&oe=59033A63'
         }
    ]

    markers = [
        {
            'title': u'Porto Cathedral',
            'latitude': 41.14285504813144,
            'longitude': -8.611221313476562,
            'description': u'My city',
            'user_id': 1,
            'type': 'monument'
        },
        {
            'title': u'Clérigos tower',
            'latitude': 41.145698998819604,
            'longitude': -8.614654541015625,
            'description': u'My city',
            'user_id': 1,
            'type': 'monument'
        },
        {
            'title': u'Soares dos Reis National Museum',
            'latitude': 41.145698998819604,
            'longitude': -8.614654541015625,
            'description': u'My city',
            'user_id': 1,
            'type': 'monument'
        },
        {
            'title': u'Palácio da Bolsa',
            'latitude': 41.14138454798386,
            'longitude': -8.615684509277344,
            'description': u'My city',
            'user_id': 1,
            'type': 'monument'
        },
        {
            'title': u'San Francis Church',
            'latitude': 41.14101287789148,
            'longitude': -8.615727424621582,
            'description': u'My city',
            'user_id': 1,
            'type': 'monument'
        },
        {
            'title': u'Alfândega do Porto',
            'latitude': 41.14317823055742,
            'longitude': -8.62152099609375,
            'description': u'My city',
            'user_id': 1,
            'type': 'museum'
        },
        {
            'title': u"Porto's planetarium",
            'latitude': 41.15071600881435,
            'longitude': -8.638461828231812,
            'description': u'My city',
            'user_id': 1,
            'type': 'museum'
        },
        {
            'title': u'Electric car museum',
            'latitude': 41.14758951142637,
            'longitude': -8.632936477661133,
            'description': u'My city',
            'user_id': 1,
            'type': 'museum'
        },
        {
            'title': u'Ipanema Park Hotel',
            'latitude': 41.15444014316899,
            'longitude': -8.649802207946777,
            'description': u'My city',
            'user_id': 1,
            'type': 'hotel'
        },
        {
            'title': u'Cais de Gaia Restaurants',
            'latitude': 41.13765159183658,
            'longitude': -8.61851692199707,
            'description': u'My city',
            'user_id': 1,
            'type': 'restaurant'
        },
        {
            'title': u'Cais de Gaia Coffee Shops',
            'latitude': 41.13749806744656,
            'longitude': -8.6172616481781,
            'description': u'My city',
            'user_id': 1,
            'type': 'coffee'
        },

        {
            'title': u'Arrábida Bridge',
            'latitude': 41.14754103742501,
            'longitude': -8.640317916870117,
            'description': u'Best sunset in town',
            'user_id': 1,
            'type': 'other'
        },
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
                user_id=m['user_id'],
                type=m['type']
            ))
        self.session.commit()

pop = Populate_database()
pop.add_users()
pop.add_markers()