# notifications/urls.py
from django.urls import path
from .views import NotificationListView, MarkAllReadView, MarkNotificationReadView

app_name = 'notifications'

urlpatterns = [
    path("notifications/", NotificationListView.as_view(), name="notifications-list"),
    path("notifications/mark-read/", MarkAllReadView.as_view(), name="notifications-mark-read"),
    path("notifications/<int:pk>/mark-read/", MarkNotificationReadView.as_view(), name="notification-mark-read"),
]