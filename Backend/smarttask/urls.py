from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.urls import path

# Views
from accounts.views import (
    RegisterView,
    update_user_role,
    reset_user_password,
    change_my_password,
    list_users,
    list_audit_logs,
    UserViewSet,
    get_current_user,
)
from projects.views import ProjectListCreateView, ProjectDetailView
from tasks.views import TaskListCreateView, TaskDetailView

# Router for ViewSets
router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

# Swagger / Redoc schema
schema_view = get_schema_view(
    openapi.Info(
        title="SmartTask API",
        default_version="v1",
        description="API documentation for SmartTask backend",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="support@smarttask.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # Authentication
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api/auth/update-role/<int:user_id>/", update_user_role, name="update_user_role"),
    path("api/auth/reset-password/<int:user_id>/", reset_user_password, name="reset_user_password"),
    path("api/auth/change-password/", change_my_password, name="change_my_password"),

    # Projects
    path("api/projects/", ProjectListCreateView.as_view(), name="project-list-create"),
    path("api/projects/<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),

    # Tasks
    path("api/tasks/", TaskListCreateView.as_view(), name="task-list-create"),
    path("api/tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),

    # Accounts utilities
    path("api/list-users/", list_users, name="list_users"),
    path("api/list-audit-logs/", list_audit_logs, name="list_audit_logs"),

    # Router endpoints (UserViewSet)
    path("api/", include(router.urls)),

    path("api/", include("notifications.urls")),
    path("api/ai/", include("ai.urls")),
    path("api/me/", get_current_user, name="get_current_user"),
    path('api/analytics/', include('analytics.urls')),
    path('api/analytics/', include('analytics.urls')),


    # API Docs
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]
