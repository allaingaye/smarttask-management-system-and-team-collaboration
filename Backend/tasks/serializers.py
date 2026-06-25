from rest_framework import serializers
from .models import Task
from datetime import date
from projects.models import Project

class TaskSerializer(serializers.ModelSerializer):
    # Add computed field
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = "__all__"  # includes all model fields + is_overdue

    def get_is_overdue(self, obj):
    
        if obj.due_date and obj.status != "completed":
            return obj.due_date < date.today()
        return False

    def validate_due_date(self, value):
       
        project_id = self.initial_data.get("project")
        if project_id:
            try:
                proj = Project.objects.get(pk=project_id)
                if value < proj.start_date or value > proj.end_date:
                    raise serializers.ValidationError(
                        "Due date must be within the project's start and end dates."
                    )
            except Project.DoesNotExist:
                raise serializers.ValidationError("Project does not exist.")
        return value
class TaskSerializer(serializers.ModelSerializer):
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = "__all__"

    def get_is_overdue(self, obj):
        if obj.due_date and obj.status != "completed":
            return obj.due_date < date.today()
        return False

    def validate_due_date(self, value):
        project_id = self.initial_data.get("project")
        if project_id:
            try:
                proj = Project.objects.get(pk=project_id)
                if value < proj.start_date or value > proj.end_date:
                    raise serializers.ValidationError(
                        "Due date must be within the project's start and end dates."
                    )
            except Project.DoesNotExist:
                raise serializers.ValidationError("Project does not exist.")
        return value