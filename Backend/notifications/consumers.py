# notifications/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        
        print(f"🔌 Consumer connect - User: {user}")
        print(f"🔌 Channel name: {self.channel_name}")
        
        if user and user.is_authenticated:
            self.group_name = f"user_{user.id}"
            print(f"✅ Adding user {user.id} to group: {self.group_name}")
            
            try:
                # ✅ Add to channel group
                await self.channel_layer.group_add(
                    self.group_name,
                    self.channel_name
                )
                
                # ✅ Accept the connection
                await self.accept()
                print(f"✅ WebSocket accepted for user {user.id}")
                
                # ✅ Send a welcome message
                await self.send(text_data=json.dumps({
                    "type": "connection",
                    "status": "connected",
                    "message": "WebSocket connection established",
                    "user_id": user.id
                }))
                
            except Exception as e:
                print(f"❌ Error in connect: {e}")
                import traceback
                traceback.print_exc()
                await self.close()
        else:
            print(f"❌ User not authenticated: {user}")
            await self.close()

    async def disconnect(self, close_code):
        print(f"🔌 Disconnect called with code: {close_code}")
        if hasattr(self, "group_name"):
            try:
                await self.channel_layer.group_discard(
                    self.group_name,
                    self.channel_name
                )
                print(f"✅ Removed from group: {self.group_name}")
            except Exception as e:
                print(f"❌ Error removing from group: {e}")
        print(f"🔌 Disconnected")

    # ✅ CRITICAL: This method must exist
    async def receive(self, text_data):
        """Handle messages from the client."""
        print(f"📨 Received from client: {text_data}")
        try:
            data = json.loads(text_data)
            # Handle client messages if needed
            # For now, just echo back
            await self.send(text_data=json.dumps({
                "type": "echo",
                "message": data
            }))
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON received: {text_data}")

    async def send_notification(self, event):
        """Send notification to client."""
        print(f"📤 Sending notification: {event['message']}")
        try:
            await self.send(text_data=json.dumps(event["message"]))
            print(f"✅ Notification sent successfully")
        except Exception as e:
            print(f"❌ Error sending notification: {e}")