from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

import jwt
from django.conf import settings

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope['headers'])
        #print(scope["query_string"].decode())
        if b'authorization' in scope["query_string"]:
            token_name, token_key = scope["query_string"].decode().split("=")
            
            if token_name == 'authorization':
                try:
                    UntypedToken(token_key)
                    decoded_data = jwt.decode(token_key, settings.SECRET_KEY, algorithms=["HS256"])
                    user = await get_user(decoded_data['user_id'])
                    scope['user'] = user
                except (InvalidToken, TokenError, jwt.DecodeError) as e:
                    scope['user'] = AnonymousUser()
        return await super().__call__(scope, receive, send)
