from django.db import models
from accounts.models import User

class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ("active", "Active"),
        ("completed", "Completed"),
        ("archived", "Archived"),
    ])
    manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name="managed_projects")

    def __str__(self):
        return self.name
