# accounts/views.py
from django.shortcuts import render, get_object_or_404
from rest_framework import generics
from .models import User, AuditLog
from .serializers import RegisterSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer
from django.db.models import Q

# ✅ Import custom permissions
from .permissions import IsAdmin, IsAnyUser


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == "Admin":
            return User.objects.all()
        elif user.role == "Manager":
            return User.objects.filter(role="Member") | User.objects.filter(id=user.id)
        else:  # Member
            return User.objects.filter(id=user.id)


# ✅ Custom paginator with page_size + ordering support
class CustomPageNumberPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


# ✅ Admin updates user role
@swagger_auto_schema(
    method="patch",
    operation_description="Update a user's role (Admin only).",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "role": openapi.Schema(type=openapi.TYPE_STRING, enum=["Admin", "Manager", "Member"])
        },
        required=["role"],
    ),
    responses={200: "Role updated successfully", 400: "Invalid role", 403: "Cannot change role of a superuser"}
)
@api_view(["PATCH"])
@permission_classes([IsAdmin])
def update_user_role(request, user_id):
    user = get_object_or_404(User, id=user_id)

    if user.is_superuser:
        return Response({"error": "Cannot change role of a superuser"}, status=403)

    new_role = request.data.get("role")

    if new_role in ["Admin", "Manager", "Member"]:
        old_role = user.role
        user.role = new_role
        user.is_staff = True if new_role == "Admin" else False
        user.save()

        # ✅ Log the action
        AuditLog.objects.create(
            actor=request.user,
            target_user=user,
            action=f"changed role from {old_role} to {new_role}"
        )

        return Response({
            "message": f"Role updated to {new_role}",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            }
        })

    return Response({"error": "Invalid role"}, status=400)


# ✅ Admin resets another user's password
@swagger_auto_schema(
    method="patch",
    operation_description="Reset a user's password (Admin only).",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "password": openapi.Schema(type=openapi.TYPE_STRING)
        },
        required=["password"],
    ),
    responses={200: "Password reset successful", 400: "Password required"}
)
@api_view(["PATCH"])
@permission_classes([IsAdmin])
def reset_user_password(request, user_id):
    user = get_object_or_404(User, id=user_id)
    new_password = request.data.get("password")
    
    if not new_password:
        return Response({"error": "Password is required"}, status=400)
    
    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters"}, status=400)
    
    user.set_password(new_password)
    user.save()

    # ✅ Log the action
    AuditLog.objects.create(
        actor=request.user,
        target_user=user,
        action="reset password"
    )

    return Response({"message": "Password reset successful"})


# ✅ User changes their own password
@swagger_auto_schema(
    method="patch",
    operation_description="Change your own password.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "old_password": openapi.Schema(type=openapi.TYPE_STRING),
            "new_password": openapi.Schema(type=openapi.TYPE_STRING),
        },
        required=["old_password", "new_password"],
    ),
    responses={200: "Password changed successfully", 400: "Old password incorrect"}
)
@api_view(["PATCH"])
@permission_classes([IsAnyUser])
def change_my_password(request):
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response({"error": "Both old and new passwords are required"}, status=400)

    if not user.check_password(old_password):
        return Response({"error": "Old password is incorrect"}, status=400)

    if len(new_password) < 8:
        return Response({"error": "New password must be at least 8 characters"}, status=400)

    user.set_password(new_password)
    user.save()
    
    return Response({"message": "Password changed successfully"})


# ✅ Admin lists all users (with pagination + ordering + role filter)
@swagger_auto_schema(
    method="get",
    operation_description="List all users (Admin only, paginated, supports ?page_size=, ?ordering=username, and ?role=Manager).",
    manual_parameters=[
        openapi.Parameter("page", openapi.IN_QUERY, description="Page number", type=openapi.TYPE_INTEGER, default=1),
        openapi.Parameter("page_size", openapi.IN_QUERY, description="Number of results per page", type=openapi.TYPE_INTEGER, default=10),
        openapi.Parameter("ordering", openapi.IN_QUERY, description="Order by field (e.g., username, -username)", type=openapi.TYPE_STRING, default="username"),
        openapi.Parameter("role", openapi.IN_QUERY, description="Filter by role (Admin, Manager, Member)", type=openapi.TYPE_STRING, required=False),
        openapi.Parameter("search", openapi.IN_QUERY, description="Search by username or email", type=openapi.TYPE_STRING, required=False),
    ],
    responses={
        200: openapi.Response(
            description="Paginated list of users",
            examples={
                "application/json": {
                    "count": 125,
                    "next": "http://localhost:8000/api/list-users/?ordering=username&page_size=20&page=3",
                    "previous": "http://localhost:8000/api/list-users/?ordering=username&page_size=20&page=1",
                    "results": [
                        {
                            "id": 21,
                            "username": "lucien",
                            "email": "lucien@example.com",
                            "role": "Manager",
                            "is_staff": False,
                            "is_superuser": False
                        },
                        {
                            "id": 22,
                            "username": "hassan",
                            "email": "hassan@example.com",
                            "role": "Member",
                            "is_staff": False,
                            "is_superuser": False
                        }
                    ]
                }
            }
        )
    }
)
@api_view(["GET"])
@permission_classes([IsAdmin])
def list_users(request):
    # ✅ Get all users with email included
    users = User.objects.all().values(
        "id", 
        "username", 
        "email",          # ✅ Added email
        "role", 
        "is_staff", 
        "is_superuser"
    )

    # ✅ Search filter
    search = request.query_params.get("search")
    if search:
        users = users.filter(
            Q(username__icontains=search) | Q(email__icontains=search)
        )

    # ✅ Role filter
    role = request.query_params.get("role")
    if role and role in ["Admin", "Manager", "Member"]:
        users = users.filter(role=role)

    # ✅ Ordering support
    ordering = request.query_params.get("ordering")
    if ordering:
        users = users.order_by(ordering)

    # ✅ Pagination
    paginator = CustomPageNumberPagination()
    paginated_users = paginator.paginate_queryset(users, request)
    return paginator.get_paginated_response(paginated_users)


# ✅ Admin views audit logs (with pagination + ordering + filters)
@swagger_auto_schema(
    method="get",
    operation_description="View audit logs (Admin only, paginated, supports ?page_size= and ?ordering=-timestamp).",
    manual_parameters=[
        openapi.Parameter("page", openapi.IN_QUERY, description="Page number", type=openapi.TYPE_INTEGER, default=1),
        openapi.Parameter("page_size", openapi.IN_QUERY, description="Number of results per page", type=openapi.TYPE_INTEGER, default=20),
        openapi.Parameter("ordering", openapi.IN_QUERY, description="Order by field (e.g., timestamp, -timestamp)", type=openapi.TYPE_STRING, default="-timestamp"),
        openapi.Parameter("actor", openapi.IN_QUERY, description="Filter by actor username", type=openapi.TYPE_STRING, required=False),
        openapi.Parameter("action", openapi.IN_QUERY, description="Filter by action type", type=openapi.TYPE_STRING, required=False),
    ],
    responses={
        200: openapi.Response(
            description="Paginated list of audit logs",
            examples={
                "application/json": {
                    "count": 300,
                    "next": "http://localhost:8000/api/list-audit-logs/?ordering=-timestamp&page_size=50&page=2",
                    "previous": None,
                    "results": [
                        {
                            "id": 1,
                            "actor__username": "allaingaye",
                            "target_user__username": "lucien",
                            "action": "changed role from Manager to Admin",
                            "timestamp": "2026-06-11T01:05:00Z"
                        },
                        {
                            "id": 2,
                            "actor__username": "allaingaye",
                            "target_user__username": "hassan",
                            "action": "reset password",
                            "timestamp": "2026-06-11T01:10:00Z"
                        }
                    ]
                }
            }
        )
    }
)
@api_view(["GET"])
@permission_classes([IsAdmin])
def list_audit_logs(request):
    logs = AuditLog.objects.all().values(
        "id", 
        "actor__username", 
        "target_user__username", 
        "action", 
        "timestamp"
    )

    # ✅ Filter by actor
    actor = request.query_params.get("actor")
    if actor:
        logs = logs.filter(actor__username__icontains=actor)

    # ✅ Filter by action
    action = request.query_params.get("action")
    if action:
        logs = logs.filter(action__icontains=action)

    # ✅ Ordering support
    ordering = request.query_params.get("ordering")
    if ordering:
        logs = logs.order_by(ordering)

    # ✅ Pagination
    paginator = CustomPageNumberPagination()
    paginated_logs = paginator.paginate_queryset(logs, request)
    return paginator.get_paginated_response(paginated_logs)


# ✅ Get current user info
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
    })