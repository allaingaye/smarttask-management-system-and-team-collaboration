# projects/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from .models import Project
from .serializers import ProjectSerializer
from accounts.permissions import (
    IsAdminOrManagerOrReadOnly,
    IsProjectOwnerOrAdmin,
    CanCreateProject,
    CanDeleteProject,
    IsAdminOrManager
)
from accounts.models import AuditLog
import logging

logger = logging.getLogger(__name__)

class ProjectListCreateView(generics.ListCreateAPIView):
    
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManagerOrReadOnly]

    def get_queryset(self):
       
        user = self.request.user
        
        # Admin can see all projects
        if user.role == "Admin":
            return Project.objects.all()
        
        # Manager can see only their projects
        if user.role == "Manager":
            return Project.objects.filter(manager=user)
        
        # Member can see projects they're part of
        # If you have a members field in Project model
        if user.role == "Member":
            # Option 1: If you have a many-to-many field for members
            # return Project.objects.filter(members=user)
            
            # Option 2: If you want members to see all projects (read-only)
            return Project.objects.all()
        
        return Project.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Override create method for better error handling and debugging
        """
        try:
            # Log incoming request
            logger.info(f"📥 Create project request from user: {request.user.email} (role: {request.user.role})")
            logger.info(f"📦 Request data: {request.data}")
            
            # Check if user can create projects
            if request.user.role not in ["Admin", "Manager"]:
                return Response(
                    {'error': 'Only admins and managers can create projects'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Create serializer with request data
            serializer = self.get_serializer(data=request.data)
            
            # Validate data
            if not serializer.is_valid():
                logger.error(f"❌ Serializer errors: {serializer.errors}")
                return Response(
                    {'errors': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save with manager
            project = serializer.save(manager=request.user)
            
            # Create audit log
            AuditLog.objects.create(
                actor=request.user,
                target_user=request.user,
                action=f"created project '{project.name}'"
            )
            
            logger.info(f"✅ Project created successfully: {project.id} - {project.name}")
            
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
            
        except IntegrityError as e:
            logger.error(f"❌ Integrity error: {str(e)}")
            return Response(
                {'error': 'A project with this name may already exist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"❌ Unexpected error: {str(e)}")
            return Response(
                {'error': f'Failed to create project: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
   
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsProjectOwnerOrAdmin]

    def get_queryset(self):
        """
        Filter queryset based on user role
        """
        user = self.request.user
        
        if user.role == "Admin":
            return Project.objects.all()
        
        if user.role == "Manager":
            return Project.objects.filter(manager=user)
        
        # Members can view all projects (read-only)
        if user.role == "Member":
            return Project.objects.all()
        
        return Project.objects.none()

    def update(self, request, *args, **kwargs):
        """
        Override update method for better error handling
        """
        try:
            instance = self.get_object()
            
            # Ensure manager field is preserved if not provided
            if 'manager' not in request.data:
                request.data['manager'] = instance.manager.id
            
            # Log update attempt
            logger.info(f"📝 Update project {instance.id} by user: {request.user.email}")
            logger.info(f"📦 Update data: {request.data}")
            
            serializer = self.get_serializer(instance, data=request.data, partial=False)
            
            if not serializer.is_valid():
                logger.error(f"❌ Serializer errors: {serializer.errors}")
                return Response(
                    {'errors': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save the project
            project = serializer.save()
            
            # Create audit log
            AuditLog.objects.create(
                actor=request.user,
                target_user=request.user,
                action=f"updated project '{project.name}'"
            )
            
            logger.info(f"✅ Project updated successfully: {project.id}")
            
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"❌ Error updating project: {str(e)}")
            return Response(
                {'error': f'Failed to update project: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        """
        Override destroy method for better error handling
        """
        try:
            instance = self.get_object()
            project_name = instance.name
            project_id = instance.id
            
            # Check if user can delete
            if request.user.role != "Admin":
                return Response(
                    {'error': 'Only admins can delete projects'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Create audit log before deletion
            AuditLog.objects.create(
                actor=request.user,
                target_user=request.user,
                action=f"deleted project '{project_name}'"
            )
            
            instance.delete()
            
            logger.info(f"🗑️ Project deleted: {project_id} - {project_name}")
            
            return Response(
                {'message': f'Project "{project_name}" deleted successfully'},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"❌ Error deleting project: {str(e)}")
            return Response(
                {'error': f'Failed to delete project: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )