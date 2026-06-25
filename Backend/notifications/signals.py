# notifications/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from projects.models import Project
from tasks.models import Task
from notifications.utils import notify_user

# ✅ Project creation + update
@receiver(post_save, sender=Project)
def project_signal(sender, instance, created, **kwargs):
    if created:
        # New project
        notify_user(
            user_id=instance.manager.id,
            payload={
                "type": "project",
                "title": "New Project Created",
                "body": f"Project '{instance.name}' has been created.",
                "unread": True,
            },
        )
    else:
        # Project updated (e.g., deadline change)
        notify_user(
            user_id=instance.manager.id,
            payload={
                "type": "project",
                "title": "Project Updated",
                "body": f"Project '{instance.name}' has been updated.",
                "unread": True,
            },
        )

# ✅ Task creation + update
@receiver(post_save, sender=Task)
def task_signal(sender, instance, created, **kwargs):
    if created and instance.assigned_to:
        # New task assigned
        notify_user(
            user_id=instance.assigned_to.id,
            payload={
                "type": "task",
                "title": "New Task Assigned",
                "body": f"You have been assigned '{instance.title}'.",
                "unread": True,
            },
        )
    else:
        if instance.assigned_to:
            # Task updated
            notify_user(
                user_id=instance.assigned_to.id,
                payload={
                    "type": "task",
                    "title": "Task Updated",
                    "body": f"Task '{instance.title}' status changed to {instance.status}.",
                    "unread": True,
                },
            )
            # ✅ Also notify the project manager
            if instance.project and instance.project.manager:
                notify_user(
                    user_id=instance.project.manager.id,
                    payload={
                        "type": "task",
                        "title": "Task Updated",
                        "body": f"Task '{instance.title}' in project '{instance.project.name}' "
                                f"was updated to {instance.status}.",
                        "unread": True,
                    },
                )

            # ✅ Special case: task completed
            if instance.status.lower() == "completed":
                # Notify assigned user
                notify_user(
                    user_id=instance.assigned_to.id,
                    payload={
                        "type": "task",
                        "title": "Task Completed",
                        "body": f"Task '{instance.title}' has been marked complete.",
                        "unread": True,
                    },
                )
                # Notify project manager
                if instance.project and instance.project.manager:
                    notify_user(
                        user_id=instance.project.manager.id,
                        payload={
                            "type": "task",
                            "title": "Task Completed",
                            "body": f"Task '{instance.title}' in project '{instance.project.name}' "
                                    f"has been completed.",
                            "unread": True,
                        },
                    )
