from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import User

import jwt
from django.conf import settings

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get("token", [None])[0]

        if token:
            try:
                UntypedToken(token)
                decoded_data = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user = await get_user(decoded_data['user_id'])
                print(user)
                scope["user"] = user
            except (InvalidToken, TokenError, User.DoesNotExist) as e:
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)