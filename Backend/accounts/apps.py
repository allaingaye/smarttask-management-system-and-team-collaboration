# Backend/accounts/apps.py
from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self):
        """
        Create default users when the app is ready.
        This runs automatically on startup.
        """
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            print("=" * 60)
            print("🔄 Checking for default users...")
            
            # ✅ Create Admin user if none exists
            if not User.objects.filter(is_superuser=True).exists():
                User.objects.create_superuser(
                    username='lucien',
                    email='lucien@example.com',
                    password='Admin123!',
                    role='Admin'
                )
                print("✅ Admin user created successfully!")
                print("   📧 Username: lucien")
                print("   🔑 Password: Admin123!")
                print("   👤 Role: Admin")
            else:
                admin = User.objects.filter(is_superuser=True).first()
                print(f"✅ Admin user already exists: {admin.username}")
            
            # ✅ Create Manager user if none exists
            if not User.objects.filter(username='manager').exists():
                User.objects.create_user(
                    username='manager',
                    email='manager@example.com',
                    password='Manager123!',
                    role='Manager'
                )
                print("✅ Manager user created successfully!")
                print("   📧 Username: manager")
                print("   🔑 Password: Manager123!")
                print("   👤 Role: Manager")
            else:
                manager = User.objects.get(username='manager')
                print(f"✅ Manager user already exists: {manager.username}")
            
            print("=" * 60)
            print("📋 Default Users Summary:")
            print("   👑 Admin: lucien / Admin123!")
            print("   📊 Manager: manager / Manager123!")
            print("=" * 60)
                
        except Exception as e:
            print(f"⚠️ Could not create default users: {e}")
            import traceback
            traceback.print_exc()
