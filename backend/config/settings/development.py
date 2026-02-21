from .base import *

SECRET_KEY = 'django-insecure-g=g6e!b2(l%5m-pj&tp4+arbed0dbevukd_(td5*0(g)46-1bq'

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
