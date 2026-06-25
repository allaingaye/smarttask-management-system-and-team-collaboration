# smarttask/asgi.py
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smarttask.settings")

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.middleware import BaseMiddleware
from asgiref.sync import sync_to_async
import notifications.routing

# ✅ Custom JWT middleware with async-safe ORM calls
class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        token = None
        if "token=" in query_string:
            token = query_string.split("token=")[-1]

        print("Incoming query_string:", query_string)
        print("Extracted token:", token)

        if token:
            try:
                from rest_framework_simplejwt.tokens import AccessToken
                from django.contrib.auth.models import AnonymousUser
                from accounts.models import User

                access_token = AccessToken(token)

                # ✅ Use sync_to_async for ORM
                user = await sync_to_async(User.objects.get)(id=access_token["user_id"])
                scope["user"] = user
                print("Resolved user:", user)
            except Exception as e:
                from django.contrib.auth.models import AnonymousUser
                scope["user"] = AnonymousUser()
                print("JWTAuthMiddleware error:", e)
        else:
            from django.contrib.auth.models import AnonymousUser
            scope["user"] = AnonymousUser()
            print("No token provided, using AnonymousUser")

        return await super().__call__(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(
            notifications.routing.websocket_urlpatterns
        )
    ),
})
