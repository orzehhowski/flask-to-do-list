import os
base = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-wont-get-it'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(base, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False