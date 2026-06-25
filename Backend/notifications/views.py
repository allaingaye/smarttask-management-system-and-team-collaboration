# notifications/views.py
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """List all notifications for the authenticated user."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-time")


class MarkAllReadView(APIView):
    """Mark all notifications as read for the authenticated user."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        count = Notification.objects.filter(user=request.user, unread=True).update(unread=False)
        return Response({
            "status": "success", 
            "message": f"{count} notifications marked as read",
            "count": count
        })


class MarkNotificationReadView(APIView):
    """Mark a single notification as read."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.unread = False
            notification.save()
            return Response({
                "status": "success", 
                "message": f"Notification {pk} marked as read"
            })
        except Notification.DoesNotExist:
            return Response({
                "status": "error", 
                "message": "Notification not found"
            }, status=404)