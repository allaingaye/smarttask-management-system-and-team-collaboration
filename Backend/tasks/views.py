from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Task
from .serializers import TaskSerializer
from accounts.permissions import IsTaskOwnerOrAdminOrManager
from accounts.models import AuditLog


class TaskListCreateView(generics.ListCreateAPIView):
    """
    List all tasks or create a new task.
    - Admins/Managers can create tasks.
    - Members can only view tasks.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsTaskOwnerOrAdminOrManager]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["project", "status", "assigned_to", "priority"]
    ordering_fields = ["due_date", "status", "title", "priority"]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "Member":
            task = serializer.save(assigned_to=user)
        else:
            task = serializer.save()

        # ✅ Log creation (target_user may be None)
        AuditLog.objects.create(
            actor=self.request.user,
            target_user=task.assigned_to,
            action=f"created task '{task.title}'"
        )


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a task.
    - Admins/Managers can manage any task.
    - Members can only update/view their own tasks.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsTaskOwnerOrAdminOrManager]

    def perform_update(self, serializer):
        task = serializer.save()
        # ✅ Log update (target_user may be None)
        AuditLog.objects.create(
            actor=self.request.user,
            target_user=task.assigned_to,
            action=f"updated task '{task.title}'"
        )

    def perform_destroy(self, instance):
        # ✅ Log deletion (target_user may be None)
        AuditLog.objects.create(
            actor=self.request.user,
            target_user=instance.assigned_to,
            action=f"deleted task '{instance.title}'"
        )
        instance.delete()
