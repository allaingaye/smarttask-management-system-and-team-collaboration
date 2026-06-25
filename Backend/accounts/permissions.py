# accounts/permissions.py
from rest_framework import permissions
from rest_framework.permissions import BasePermission

# ==================== ✅ EXISTING PERMISSIONS ====================

class IsAdminOrManagerOrReadOnly(BasePermission):
    """
    Custom permission: only Admins and Managers can create/update/delete,
    Members can only view.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ["Admin", "Manager"]


class IsTaskOwnerOrAdminOrManager(BasePermission):
    """
    Custom permission: Admins and Managers can do anything,
    Members can only update/view tasks assigned to them.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ["Admin", "Manager"]:
            return True
        return obj.assigned_to == request.user


class IsAdmin(BasePermission):
    """Admin only - full system access."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Admin"


class IsManager(BasePermission):
    """Manager only - can manage projects and tasks."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Manager"


class IsMember(BasePermission):
    """Member only - can work on assigned tasks."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Member"


class IsAdminOrManager(BasePermission):
    """Admin or Manager - can manage projects and tasks."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["Admin", "Manager"]


class IsAnyUser(BasePermission):
    """Any authenticated user."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["Admin", "Manager", "Member"]


# ==================== ✅ MANAGER-SPECIFIC PERMISSIONS ====================

class IsProjectOwnerOrAdmin(BasePermission):
    """
    Custom permission: only the project owner (manager) or Admin can edit/update.
    Members can view.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ["Admin", "Manager"]

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.role == "Admin":
            return True
        
        if request.user.role == "Manager":
            return obj.manager == request.user
        
        return False


class IsProjectManagerOrAdmin(BasePermission):
    """
    Custom permission: only the project manager or Admin can perform actions.
    Used for task operations within a project.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["Admin", "Manager"]

    def has_object_permission(self, request, view, obj):
        if request.user.role == "Admin":
            return True
        
        if request.user.role == "Manager":
            if hasattr(obj, 'project'):
                return obj.project.manager == request.user
            if hasattr(obj, 'manager'):
                return obj.manager == request.user
        
        return False


class CanCreateProject(BasePermission):
    """
    Custom permission: only Admins and Managers can create projects.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["Admin", "Manager"]


class CanDeleteProject(BasePermission):
    """
    Custom permission: only Admins can delete projects.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Admin"

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.role == "Admin"


class CanAssignTasks(BasePermission):
    """
    Custom permission: only Admins and Managers can assign tasks.
    Managers can only assign tasks in their own projects.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["Admin", "Manager"]

    def has_object_permission(self, request, view, obj):
        if request.user.role == "Admin":
            return True
        
        if request.user.role == "Manager":
            if hasattr(obj, 'project'):
                return obj.project.manager == request.user
            if hasattr(obj, 'manager'):
                return obj.manager == request.user
        
        return False


class CanViewProjectAnalytics(BasePermission):
    """
    Custom permission: only Admins and Managers can view project analytics.
    Managers can only view analytics for their own projects.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["Admin", "Manager"]

    def has_object_permission(self, request, view, obj):
        if request.user.role == "Admin":
            return True
        
        if request.user.role == "Manager":
            if hasattr(obj, 'manager'):
                return obj.manager == request.user
            if hasattr(obj, 'project'):
                return obj.project.manager == request.user
        
        return False


class CanViewProjectAIInsights(BasePermission):
    """
    Custom permission: only Admins and Managers can view AI insights.
    Managers can only view AI insights for their own projects.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["Admin", "Manager"]

    def has_object_permission(self, request, view, obj):
        if request.user.role == "Admin":
            return True
        
        if request.user.role == "Manager":
            if hasattr(obj, 'manager'):
                return obj.manager == request.user
            if hasattr(obj, 'project'):
                return obj.project.manager == request.user
        
        return False


class IsProjectMember(BasePermission):
    """
    Custom permission: user must be a member of the project (assigned to tasks).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role in ["Admin", "Manager"]:
            return True
        
        if request.user.role == "Member":
            if hasattr(obj, 'tasks'):
                return obj.tasks.filter(assigned_to=request.user).exists()
            if hasattr(obj, 'project'):
                return obj.project.tasks.filter(assigned_to=request.user).exists()
        
        return False


class CanManageTeamMembers(BasePermission):
    """
    Custom permission: only Admins and Managers can manage team members.
    Managers can only manage members in their own projects.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["Admin", "Manager"]

    def has_object_permission(self, request, view, obj):
        if request.user.role == "Admin":
            return True
        
        if request.user.role == "Manager":
            if hasattr(obj, 'project'):
                return obj.project.manager == request.user
            if hasattr(obj, 'manager'):
                return obj.manager == request.user
        
        return False


class CanViewTeamMembers(BasePermission):
    """
    Custom permission: Admins can view all, Managers can view their team members.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == "Admin":
            return True
        
        if request.user.role == "Manager":
            if hasattr(obj, 'project'):
                return obj.project.manager == request.user
            if hasattr(obj, 'manager'):
                return obj.manager == request.user
        
        return False