# test_connection.py
import asyncio
import json
import requests
import sys

try:
    import websockets
except ImportError:
    print("❌ websockets package not installed!")
    print("📦 Run: pip install websockets")
    sys.exit(1)

async def test_websocket():
    """Simple WebSocket connection test"""
    
    print("\n" + "=" * 60)
    print("🔧 WebSocket Connection Test")
    print("=" * 60)
    
    # Your credentials are pre-filled
    username = "allaingaye"
    password = "lucien123"
    
    print(f"\n👤 Username: {username}")
    print(f"🔑 Password: {'*' * len(password)}")
    
    # Get token
    print(f"\n🔐 Logging in as: {username}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/login/",
            json={"username": username, "password": password},
            timeout=5
        )
        
        if response.status_code != 200:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)
            return
        
        token = response.json().get("access")
        print(f"✅ Token obtained: {token[:30]}...")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Django server!")
        print("   Make sure to run: daphne -p 8000 smarttask.asgi:application")
        return
    except Exception as e:
        print(f"❌ Error getting token: {e}")
        return
    
    # Connect to WebSocket (removed timeout parameter)
    uri = f"ws://127.0.0.1:8000/ws/notifications/?token={token}"
    
    print(f"\n🔗 Connecting to WebSocket...")
    print("=" * 60)
    
    try:
        # ✅ Removed the timeout parameter here
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            print("=" * 60)
            
            # Wait for welcome message
            try:
                welcome = await asyncio.wait_for(websocket.recv(), timeout=5)
                print(f"📨 Welcome message received:")
                try:
                    data = json.loads(welcome)
                    print(json.dumps(data, indent=2))
                except:
                    print(welcome)
                print("=" * 60)
            except asyncio.TimeoutError:
                print("⏰ No welcome message received (this might be normal)")
            except Exception as e:
                print(f"⚠️ Error receiving welcome message: {e}")
            
            print("\n📡 Listening for notifications...")
            print("💡 Send a notification from Django shell to see it here")
            print("💡 Press Ctrl+C to stop")
            print("=" * 60)
            
            # Keep listening for 30 seconds
            notification_count = 0
            for i in range(30):
                try:
                    # ✅ Using asyncio.wait_for for timeout instead
                    message = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                    notification_count += 1
                    print(f"\n📩 Received notification #{notification_count}:")
                    try:
                        data = json.loads(message)
                        print(json.dumps(data, indent=2))
                    except:
                        print(message)
                    print("=" * 60)
                except asyncio.TimeoutError:
                    # No message received, keep waiting
                    if i % 5 == 0 and i > 0:
                        print(f"⏳ Waiting for notifications... ({i}s)")
                    pass
                except websockets.exceptions.ConnectionClosed:
                    print("🔌 Connection closed by server")
                    return False
                except Exception as e:
                    print(f"⚠️ Error receiving message: {e}")
                    break
            
            if notification_count == 0:
                print("\n⚠️ No notifications received during the test.")
                print("📝 To send a test notification, run in another terminal:")
                print("   python manage.py shell")
                print("   from notifications.utils import notify_user")
                print("   notify_user(user_id=1, payload={'type':'test','title':'Test','body':'Hello'})")
            else:
                print(f"\n✅ Test completed! Received {notification_count} notification(s).")
            
            return True
                    
    except websockets.exceptions.WebSocketException as e:
        print(f"❌ WebSocket error: {e}")
        print("\n🔍 Possible causes:")
        print("  1. Memurai/Redis not running (run: memurai-cli ping)")
        print("  2. Django server not running with Daphne")
        print("  3. Wrong WebSocket URL")
        print("  4. Token expired or invalid")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        asyncio.run(test_websocket())
    except KeyboardInterrupt:
        print("\n\n👋 Test stopped by user")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")