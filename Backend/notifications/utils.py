# notifications/utils.py
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
import logging

logger = logging.getLogger(__name__)

def notify_user(user_id: int, payload: dict):
    """
    Create a notification in DB and broadcast it via Channels.
    Ensures payload always has {id, title, body, type, unread, time}.
    """
    try:
        # ✅ Save to DB
        notification = Notification.objects.create(
            user_id=user_id,
            type=payload.get("type", "info"),
            title=payload.get("title", "Notification"),
            body=payload.get("body", ""),
            unread=payload.get("unread", True),
        )

        # ✅ Build enriched payload
        enriched_payload = {
            "id": notification.id,
            "title": notification.title,
            "body": notification.body,
            "type": notification.type,
            "unread": notification.unread,
            "time": notification.time.strftime("%Y-%m-%d %H:%M:%S"),
        }

        # ✅ Broadcast via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{user_id}",
            {
                "type": "send_notification",  # must match consumer method
                "message": enriched_payload,
            }
        )

        return enriched_payload

    except Exception as e:
        logger.error(f"notify_user error: {e}")
        return None
