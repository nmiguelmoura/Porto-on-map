from sqlalchemy import Column, ForeignKey, Integer, Float, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
Base = declarative_base()


class User(Base):

    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    name = Column(String(250))
    email = Column(String(250))
    picture = Column(String(250))

class Marker(Base):

    __tablename_ = 'local'

    id = Column(Integer, primary_key=True)
    lat = Column(Float)
    long = Column(Float)
    description = Column(String(250))
    user_id = Column(Integer, ForeignKey('user.id'))
    user = relationship(User)

    @property
    def serialize(self):
        return {
            "latitude": self.lat,
            "longitude": self.long,
            "description": self.description,
            "creator": self.user.name
        }

class Favourites(Base):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    user = relationship(User)
    marker_id = Column(Integer, ForeignKey('marker.id'))
    marker = relationship(Marker)

    @property
    def serialize(self):
        return {
            "marker_id": self.marker_id,
        }


engine = create_engine('sqlite:///mapapp.db')
Base.metadata.create_all(engine)