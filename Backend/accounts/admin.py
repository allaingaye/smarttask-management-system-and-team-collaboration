from django.contrib import admin
from .models import User, AuditLog

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "is_staff", "is_superuser")
    list_filter = ("role", "is_staff", "is_superuser")
    search_fields = ("username", "email")

# ✅ Customize AuditLog display
@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "actor", "target_user", "action", "timestamp")
    list_filter = ("action", "timestamp")
    search_fields = ("actor__username", "target_user__username", "action")
    ordering = ("-timestamp",)
