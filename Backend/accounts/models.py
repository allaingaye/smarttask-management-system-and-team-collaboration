from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class Role(models.TextChoices):
    ADMIN = "Admin", "Admin"
    MANAGER = "Manager", "Manager"
    MEMBER = "Member", "Member"

class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER
    )

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_set",
        blank=True,
        help_text="The groups this user belongs to.",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_set",
        blank=True,
        help_text="Specific permissions for this user.",
    )

    def __str__(self):
        return self.username


# ✅ Audit logging model
class AuditLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="actions",
        on_delete=models.CASCADE
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="affected",
        on_delete=models.SET_NULL,   # allow nulls
        null=True, blank=True        # make field optional
    )
    action = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.target_user:
            return f"{self.actor.username} {self.action} {self.target_user.username} at {self.timestamp}"
        return f"{self.actor.username} {self.action} at {self.timestamp}"
