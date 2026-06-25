from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self):
        # ✅ No database seeding needed because roles are hard-coded in TextChoices
        # Remove any Role.objects.get_or_create(...) calls
        pass
