# ai/views.py
import openai
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Count, Q
from projects.models import Project
from tasks.models import Task
from accounts.models import User
from accounts.permissions import IsAdminOrManager, CanViewProjectAIInsights, IsProjectManagerOrAdmin
import logging

# ✅ Import the SmartProjectAnalyzer
from .smart_analyzer import SmartProjectAnalyzer

logger = logging.getLogger(__name__)

# ✅ Get OpenAI API key from settings
OPENAI_API_KEY = getattr(settings, 'OPENAI_API_KEY', None)


# ==================== 🌍 GLOBAL AI INSIGHTS (Admin Only) ====================

class AIInsightsView(APIView):
    """Global AI insights for all projects - Admin only."""
    permission_classes = [IsAuthenticated, IsAdminOrManager]

    def get(self, request):
        # ✅ Managers can only see their own projects
        if request.user.role == "Manager":
            return self.get_manager_insights(request)
        
        # ✅ Admin sees everything
        return self.get_admin_insights(request)

    def get_admin_insights(self, request):
        """Admin: Global insights for all projects."""
        try:
            now = timezone.now().date()
            last_week = now - timedelta(days=7)

            # All projects and tasks
            total_tasks = Task.objects.count()
            completed_count = Task.objects.filter(status="completed").count()
            overdue_count = Task.objects.filter(
                due_date__lt=now,
                status__in=["pending", "in_progress"]
            ).count()
            in_progress_count = Task.objects.filter(status="in_progress").count()
            pending_count = Task.objects.filter(status="pending").count()
            completion_rate = (completed_count / total_tasks * 100) if total_tasks > 0 else 0
            
            total_projects = Project.objects.count()
            active_projects = Project.objects.filter(status="active").count()
            completed_projects = Project.objects.filter(status="completed").count()
            
            completed_this_week = Task.objects.filter(
                status="completed",
                updated_at__gte=last_week
            ).count() if hasattr(Task, 'updated_at') else 0
            
            # Projects at risk
            projects_at_risk = self.get_projects_at_risk(now)
            
            # Overloaded users
            overloaded_users = self.get_overloaded_users()
            
            # AI Insights
            ai_summary, ai_predictions, ai_recommendations = self.generate_ai_insights(
                total_tasks, completed_count, completion_rate, overdue_count, 
                in_progress_count, active_projects, projects_at_risk, overloaded_users
            )

            return Response(self.build_insights_response(
                ai_summary, completion_rate, overdue_count, active_projects,
                ai_predictions, projects_at_risk, ai_recommendations, overloaded_users
            ))

        except Exception as e:
            logger.error(f"AI Insights error: {e}")
            return Response({"error": str(e)}, status=500)

    def get_manager_insights(self, request):
        """Manager: Insights only for their own projects."""
        try:
            now = timezone.now().date()
            
            # ✅ Only projects managed by this manager
            manager_projects = Project.objects.filter(manager=request.user)
            project_ids = manager_projects.values_list('id', flat=True)
            
            tasks = Task.objects.filter(project__in=project_ids)
            total_tasks = tasks.count()
            completed_count = tasks.filter(status="completed").count()
            overdue_count = tasks.filter(
                due_date__lt=now,
                status__in=["pending", "in_progress"]
            ).count()
            in_progress_count = tasks.filter(status="in_progress").count()
            pending_count = tasks.filter(status="pending").count()
            completion_rate = (completed_count / total_tasks * 100) if total_tasks > 0 else 0
            
            total_projects = manager_projects.count()
            active_projects = manager_projects.filter(status="active").count()
            completed_projects = manager_projects.filter(status="completed").count()
            
            # Projects at risk (only manager's projects)
            projects_at_risk = []
            for project in manager_projects.filter(status="active"):
                project_tasks = Task.objects.filter(project=project)
                total_project_tasks = project_tasks.count()
                overdue_project_tasks = project_tasks.filter(
                    due_date__lt=now,
                    status__in=["pending", "in_progress"]
                ).count()
                
                if total_project_tasks > 0 and (overdue_project_tasks / total_project_tasks) > 0.2:
                    projects_at_risk.append({
                        "name": project.name,
                        "id": project.id,
                        "overdue_percentage": round((overdue_project_tasks / total_project_tasks * 100), 1),
                        "overdue_count": overdue_project_tasks,
                        "total_tasks": total_project_tasks
                    })
            
            # Overloaded users in manager's projects
            team_members = User.objects.filter(tasks__project__in=project_ids).distinct()
            overloaded_users = []
            for user in team_members:
                task_count = tasks.filter(assigned_to=user, status__in=["pending", "in_progress"]).count()
                if task_count > 3:
                    overloaded_users.append({
                        "username": user.username,
                        "task_count": task_count
                    })

            # AI Insights (scoped)
            ai_summary, ai_predictions, ai_recommendations = self.generate_ai_insights(
                total_tasks, completed_count, completion_rate, overdue_count,
                in_progress_count, active_projects, projects_at_risk, overloaded_users
            )

            return Response(self.build_insights_response(
                ai_summary, completion_rate, overdue_count, active_projects,
                ai_predictions, projects_at_risk, ai_recommendations, overloaded_users,
                is_manager=True
            ))

        except Exception as e:
            logger.error(f"Manager AI Insights error: {e}")
            return Response({"error": str(e)}, status=500)

    def get_projects_at_risk(self, now):
        """Helper: Get all projects at risk."""
        projects_at_risk = []
        for project in Project.objects.filter(status="active"):
            project_tasks = Task.objects.filter(project=project)
            total_project_tasks = project_tasks.count()
            overdue_project_tasks = project_tasks.filter(
                due_date__lt=now,
                status__in=["pending", "in_progress"]
            ).count()
            
            if total_project_tasks > 0 and (overdue_project_tasks / total_project_tasks) > 0.2:
                projects_at_risk.append({
                    "name": project.name,
                    "id": project.id,
                    "overdue_percentage": round((overdue_project_tasks / total_project_tasks * 100), 1),
                    "overdue_count": overdue_project_tasks,
                    "total_tasks": total_project_tasks
                })
        return projects_at_risk

    def get_overloaded_users(self):
        """Helper: Get all overloaded users."""
        users = User.objects.all()
        overloaded = []
        for user in users:
            task_count = Task.objects.filter(assigned_to=user, status__in=["pending", "in_progress"]).count()
            if task_count > 3:
                overloaded.append({
                    "username": user.username,
                    "task_count": task_count
                })
        return overloaded

    def generate_ai_insights(self, total_tasks, completed_count, completion_rate, overdue_count,
                            in_progress_count, active_projects, projects_at_risk, overloaded_users):
        """Generate AI insights using OpenAI or fallback."""
        if OPENAI_API_KEY:
            try:
                openai.api_key = OPENAI_API_KEY
                
                # Build rich context for better insights
                context = self._build_insight_context(
                    total_tasks, completed_count, completion_rate, overdue_count,
                    in_progress_count, active_projects, projects_at_risk, overloaded_users
                )
                
                summary_prompt = (
                    f"Generate a professional project summary based on this data:\n\n"
                    f"{context}\n\n"
                    f"Provide 2-3 concise sentences highlighting key achievements and areas needing attention."
                )
                summary_response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a Senior Project Manager with 10+ years of experience. Provide concise, professional, and actionable summaries."},
                        {"role": "user", "content": summary_prompt},
                    ],
                    max_tokens=120,
                    temperature=0.7,
                )
                ai_summary = summary_response.choices[0].message["content"].strip()
                
                predictions_prompt = (
                    f"Based on this project data:\n\n{context}\n\n"
                    f"Predict which projects might miss deadlines and why. "
                    f"Be specific about risks and provide reasoning."
                )
                predictions_response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a Senior Risk Analyst. Provide specific, data-driven risk predictions."},
                        {"role": "user", "content": predictions_prompt},
                    ],
                    max_tokens=180,
                    temperature=0.8,
                )
                ai_predictions = predictions_response.choices[0].message["content"].strip()
                
                recommendations_prompt = (
                    f"Given this project situation:\n\n{context}\n\n"
                    f"Provide 3 specific, actionable recommendations to improve productivity and reduce delays. "
                    f"Be detailed and mention specific actions."
                )
                recommendations_response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a Senior Productivity Consultant. Provide specific, actionable recommendations with clear reasoning."},
                        {"role": "user", "content": recommendations_prompt},
                    ],
                    max_tokens=200,
                    temperature=0.8,
                )
                ai_recommendations = recommendations_response.choices[0].message["content"].strip()
                
            except Exception as e:
                logger.error(f"OpenAI error: {e}")
                ai_summary = self._generate_fallback_summary(
                    total_tasks, completed_count, completion_rate, overdue_count, in_progress_count
                )
                ai_predictions = self._generate_fallback_predictions(projects_at_risk)
                ai_recommendations = self._generate_fallback_recommendations(overloaded_users, overdue_count)
        else:
            # Fallback without OpenAI
            ai_summary = self._generate_fallback_summary(
                total_tasks, completed_count, completion_rate, overdue_count, in_progress_count
            )
            ai_predictions = self._generate_fallback_predictions(projects_at_risk)
            ai_recommendations = self._generate_fallback_recommendations(overloaded_users, overdue_count)
        
        return ai_summary, ai_predictions, ai_recommendations

    def _build_insight_context(self, total_tasks, completed_count, completion_rate, overdue_count,
                               in_progress_count, active_projects, projects_at_risk, overloaded_users):
        """Build rich context for OpenAI prompts."""
        context = f"""
📊 PROJECT METRICS:
- Total Tasks: {total_tasks}
- Completed: {completed_count} ({completion_rate:.1f}%)
- In Progress: {in_progress_count}
- Overdue: {overdue_count}
- Active Projects: {active_projects}

⚠️ PROJECTS AT RISK:
{len(projects_at_risk)} projects have overdue tasks

👥 TEAM WORKLOAD:
{len(overloaded_users)} team members are overloaded
"""
        if projects_at_risk:
            context += "\n🔴 AT-RISK PROJECTS:\n"
            for p in projects_at_risk[:3]:
                context += f"  - {p['name']}: {p['overdue_count']}/{p['total_tasks']} overdue ({p['overdue_percentage']:.1f}%)\n"
        
        if overloaded_users:
            context += "\n📋 OVERLOADED TEAM MEMBERS:\n"
            for u in overloaded_users[:3]:
                context += f"  - {u['username']}: {u['task_count']} active tasks\n"
        
        return context

    def _generate_fallback_summary(self, total_tasks, completed_count, completion_rate, overdue_count, in_progress_count):
        """Generate fallback summary without OpenAI."""
        if total_tasks == 0:
            return "📊 No tasks found. Start creating tasks to track progress."
        
        if overdue_count > 3:
            return f"🔴 Critical: {overdue_count} tasks overdue. {completed_count}/{total_tasks} completed ({completion_rate:.1f}%). Immediate action required to address overdue items."
        elif overdue_count > 0:
            return f"⚠️ {overdue_count} overdue tasks need attention. {completed_count}/{total_tasks} completed ({completion_rate:.1f}%). Focus on clearing overdue items."
        elif completion_rate > 70:
            return f"✅ Excellent progress! {completed_count}/{total_tasks} completed ({completion_rate:.1f}%). {in_progress_count} tasks in progress. Maintain this momentum."
        else:
            return f"📊 {completed_count}/{total_tasks} tasks completed ({completion_rate:.1f}%). {in_progress_count} in progress. Continue working towards project goals."

    def _generate_fallback_predictions(self, projects_at_risk):
        """Generate fallback predictions without OpenAI."""
        if not projects_at_risk:
            return "✅ All projects appear to be on track. No major risks detected."
        
        risk_count = len(projects_at_risk)
        if risk_count > 3:
            return f"🔴 {risk_count} projects at risk of delay. Multiple projects showing signs of falling behind schedule. Consider reviewing resource allocation."
        else:
            risk_names = ', '.join([p['name'] for p in projects_at_risk[:3]])
            return f"⚠️ {risk_count} project(s) at risk: {risk_names}. Overdue tasks are accumulating. Recommend immediate review and action."

    def _generate_fallback_recommendations(self, overloaded_users, overdue_count):
        """Generate fallback recommendations without OpenAI."""
        recommendations = []
        
        if overdue_count > 0:
            recommendations.append(f"📋 Prioritize and complete {overdue_count} overdue tasks immediately.")
        
        if overloaded_users:
            overloaded_names = ', '.join([u['username'] for u in overloaded_users[:3]])
            recommendations.append(f"👥 Rebalance workload: {overloaded_names} are overloaded. Consider redistributing tasks.")
        
        if overdue_count == 0 and not overloaded_users:
            recommendations.append("✅ Team workload appears balanced. Continue current workflow and monitor progress.")
        
        if not recommendations:
            recommendations.append("📊 Review project priorities and ensure alignment with team goals.")
        
        return ' • '.join(recommendations)

    def build_insights_response(self, ai_summary, completion_rate, overdue_count, active_projects,
                               ai_predictions, projects_at_risk, ai_recommendations, overloaded_users,
                               is_manager=False):
        """Build the insights response."""
        return [
            {"id": 1, "title": "AI Summary", "body": ai_summary, "type": "summary", "icon": "📊"},
            {"id": 2, "title": "Completion Rate", "body": f"{completion_rate:.1f}% of tasks completed.", "type": "summary", "icon": "📈"},
            {"id": 3, "title": "Overdue Tasks", "body": f"{overdue_count} tasks are overdue.", "type": "summary", "icon": "⚠️"},
            {"id": 4, "title": "Active Projects", "body": f"{active_projects} projects currently active.", "type": "summary", "icon": "📁"},
            {"id": 5, "title": "Risk Prediction", "body": ai_predictions, "type": "prediction", "icon": "🔮"},
            {"id": 6, "title": "Project Delay Risk", "body": f"{len(projects_at_risk)} project(s) at risk of delay.", "type": "prediction", "icon": "⏰"},
            {"id": 7, "title": "Workload Balance", "body": ai_recommendations, "type": "recommendation", "icon": "⚖️"},
            {"id": 8, "title": "Team Capacity", "body": f"Team has {len(overloaded_users)} overloaded member(s).", "type": "recommendation", "icon": "👥"},
        ]


# ==================== 🚀 PROJECT-SPECIFIC AI GUIDANCE (UPGRADED) ====================

class ProjectAIInsightsView(APIView):
    """
    Professional AI insights specific to a single project.
    Uses SmartProjectAnalyzer for structured insights + OpenAI for enhancement.
    """
    permission_classes = [IsAuthenticated, CanViewProjectAIInsights]

    def get(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)
            
            # ✅ Permission check
            self.check_object_permissions(request, project)
            
            # ✅ Get data
            tasks = Task.objects.filter(project=project)
            members = User.objects.filter(tasks__project=project).distinct()
            
            # ==========================================
            # PHASE 1: Smart Analysis (Always works)
            # ==========================================
            logger.info(f"🔍 Running SmartProjectAnalyzer for: {project.name}")
            analyzer = SmartProjectAnalyzer(project, tasks, members)
            analysis = analyzer.analyze()
            
            # ==========================================
            # PHASE 2: Build Structured Response
            # ==========================================
            response_data = self._build_structured_response(project, analysis, members)
            
            # ==========================================
            # PHASE 3: OpenAI Enhancement (Optional)
            # ==========================================
            if OPENAI_API_KEY:
                try:
                    enhanced = self._enhance_with_openai(analysis, project)
                    if enhanced:
                        response_data["ai_insights"]["openai_enhanced"] = enhanced
                except Exception as e:
                    logger.warning(f"OpenAI enhancement skipped: {e}")
            
            return Response(response_data)

        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=404)
        except Exception as e:
            logger.error(f"Project AI Insights error: {e}")
            return Response({"error": str(e)}, status=500)

    def _build_structured_response(self, project, analysis, members):
        """Build structured response from analysis data."""
        return {
            "project": {
                "id": project.id,
                "name": project.name,
                "status": project.status,
                "manager": project.manager.username if project.manager else None,
                "end_date": project.end_date,
            },
            "metrics": {
                "total_tasks": analysis.total_tasks,
                "completed_tasks": analysis.completed_tasks,
                "overdue_tasks": analysis.overdue_tasks,
                "in_progress_tasks": analysis.in_progress_tasks,
                "pending_tasks": analysis.pending_tasks,
                "completion_rate": analysis.completion_rate,
                "high_priority": analysis.high_priority_tasks,
            },
            "workload": {
                "team_members": [
                    {
                        "username": m.username,
                        "user_id": m.user_id,
                        "task_count": m.active_tasks,
                        "completed": m.completed_tasks,
                        "urgent_tasks": m.urgent_tasks,
                        "capacity_used": round(m.capacity_used, 1),
                        "status": m.status,
                    }
                    for m in analysis.team_workload
                ],
                "overloaded_members": [
                    {
                        "username": m.username,
                        "task_count": m.active_tasks,
                        "urgent_tasks": m.urgent_tasks,
                    }
                    for m in analysis.team_workload
                    if m.status == "overloaded"
                ],
                "total_team_members": members.count(),
                "team_health": analysis.team_insights.get("team_health", "unknown"),
            },
            "ai_insights": {
                "summary": analysis.summary,
                "risks": analysis.risks,
                "recommendations": analysis.recommendations,
                "team_insights": analysis.team_insights,
                "predictions": analysis.predictions,
                "generated_at": datetime.now().isoformat(),
            },
            "recommendations": [
                {
                    "id": rec["id"],
                    "title": rec["title"],
                    "priority": rec["priority"],
                    "description": rec["description"],
                    "actions": [
                        {
                            "action": action.get("action"),
                            "task_id": action.get("task_id"),
                            "task_title": action.get("task_title"),
                            "assignee": action.get("assignee"),
                            "from": action.get("from"),
                            "to": action.get("to"),
                            "instruction": action.get("instruction"),
                        }
                        for action in rec.get("actions", [])
                    ]
                }
                for rec in analysis.recommendations
            ],
        }

    def _enhance_with_openai(self, analysis, project):
        """Optional OpenAI enhancement for more natural language."""
        if not OPENAI_API_KEY:
            return None
        
        try:
            openai.api_key = OPENAI_API_KEY
            
            # Build rich prompt from analysis data
            prompt = self._build_openai_prompt(analysis, project)
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": """
                    You are a Senior Project Manager with 10+ years of experience.
                    
                    Guidelines for your response:
                    1. Be professional, concise, and data-driven
                    2. Mention specific task names and team members
                    3. Provide actionable recommendations with clear reasoning
                    4. Use a supportive, collaborative tone
                    5. Highlight both achievements and areas for improvement
                    
                    Format your response as:
                    SUMMARY: (2-3 sentences)
                    RISKS: (2-3 specific risks with reasoning)
                    RECOMMENDATIONS: (2-3 specific, actionable recommendations)
                    PREDICTION: (1-2 sentences on project completion outlook)
                    """},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=350,
                temperature=0.7,
            )
            
            return response.choices[0].message["content"].strip()
            
        except Exception as e:
            logger.error(f"OpenAI enhancement error: {e}")
            return None

    def _build_openai_prompt(self, analysis, project):
        """Build rich prompt for OpenAI enhancement."""
        # Extract key task names
        overdue_tasks = []
        for risk in analysis.risks:
            if risk.get("type") == "overdue":
                for task in risk.get("affected_tasks", [])[:3]:
                    overdue_tasks.append(f"'{task['task_title']}' (Assignee: {task['assignee']})")
        
        high_priority_tasks = []
        for task in project.tasks.filter(priority="high", status__in=["pending", "in_progress"])[:3]:
            high_priority_tasks.append(f"'{task.title}' (Assignee: {task.assigned_to.username if task.assigned_to else 'Unassigned'})")
        
        stalled_tasks = []
        for s in analysis.bottlenecks:
            if s.get("type") == "stalled_task":
                stalled_tasks.append(f"'{s['task_title']}' (Stalled {s.get('days_stalled', 0)} days, Assignee: {s.get('assignee', 'Unknown')})")
        
        overloaded_members = [f"{m.username} ({m.active_tasks} tasks)" for m in analysis.team_workload if m.status == "overloaded"]
        available_members = [f"{m.username} ({m.active_tasks} tasks)" for m in analysis.team_workload if m.status == "available"]
        
        prompt = f"""
PROJECT: {project.name} ({project.status})
DUE DATE: {project.end_date if project.end_date else 'Not set'}

METRICS:
- Total Tasks: {analysis.total_tasks}
- Completed: {analysis.completed_tasks} ({analysis.completion_rate}%)
- In Progress: {analysis.in_progress_tasks}
- Overdue: {analysis.overdue_tasks}
- High Priority: {analysis.high_priority_tasks}

TASK DETAILS:
{'- Overdue: ' + ', '.join(overdue_tasks) if overdue_tasks else '- No overdue tasks'}
{'- High Priority: ' + ', '.join(high_priority_tasks) if high_priority_tasks else '- No high-priority tasks'}
{'- Stalled: ' + ', '.join(stalled_tasks) if stalled_tasks else '- No stalled tasks'}

TEAM WORKLOAD:
- Overloaded: {', '.join(overloaded_members) if overloaded_members else 'None'}
- Available: {', '.join(available_members) if available_members else 'None'}

TEAM HEALTH: {analysis.team_insights.get('team_health', 'unknown')}

Based on this data, provide a professional project analysis following the format specified.
"""
        return prompt


# ==================== 📊 PROJECT CHARTS ====================

class ProjectChartsView(APIView):
    """Get chart data for project trends."""
    permission_classes = [IsAuthenticated, IsProjectManagerOrAdmin]

    def get(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)
            self.check_object_permissions(request, project)
            
            now = timezone.now().date()
            chart_data = []
            for i in range(30, -1, -1):
                date = now - timedelta(days=i)
                day_start = datetime.combine(date, datetime.min.time())
                day_end = datetime.combine(date, datetime.max.time())
                
                completed = Task.objects.filter(
                    project=project,
                    status="completed",
                    updated_at__gte=day_start,
                    updated_at__lte=day_end
                ).count() if hasattr(Task, 'updated_at') else 0
                
                created = Task.objects.filter(
                    project=project,
                    created_at__gte=day_start,
                    created_at__lte=day_end
                ).count() if hasattr(Task, 'created_at') else 0
                
                overdue = Task.objects.filter(
                    project=project,
                    due_date__lt=date,
                    status__in=["pending", "in_progress"]
                ).count()
                
                chart_data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "completed": completed,
                    "created": created,
                    "overdue": overdue,
                    "total": Task.objects.filter(project=project).count()
                })
            
            return Response({
                "project": project.name,
                "chart_data": chart_data,
                "summary": {
                    "total_completed": sum(d["completed"] for d in chart_data),
                    "total_created": sum(d["created"] for d in chart_data),
                    "current_overdue": chart_data[-1]["overdue"] if chart_data else 0,
                }
            })
            
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=404)
        except Exception as e:
            logger.error(f"Chart error: {e}")
            return Response({"error": str(e)}, status=500)


# ==================== 🔔 AI ALERTS ====================

class AIAlertCheckView(APIView):
    """Check for AI alerts and send notifications."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            now = timezone.now().date()
            alerts = []
            
            # ✅ For Managers: only their projects
            if request.user.role == "Manager":
                projects = Project.objects.filter(manager=request.user)
            else:
                projects = Project.objects.all()
            
            for project in projects:
                tasks = Task.objects.filter(project=project)
                total_tasks = tasks.count()
                overdue_tasks = tasks.filter(
                    due_date__lt=now,
                    status__in=["pending", "in_progress"]
                ).count()
                
                if total_tasks > 0 and (overdue_tasks / total_tasks) > 0.3:
                    alerts.append({
                        "project_id": project.id,
                        "project_name": project.name,
                        "severity": "critical",
                        "message": f"🚨 {overdue_tasks}/{total_tasks} tasks overdue ({int((overdue_tasks/total_tasks)*100)}%). Immediate action required!",
                        "icon": "🚨",
                        "timestamp": timezone.now().isoformat()
                    })
                elif total_tasks > 0 and (overdue_tasks / total_tasks) > 0.2:
                    alerts.append({
                        "project_id": project.id,
                        "project_name": project.name,
                        "severity": "warning",
                        "message": f"⚠️ {overdue_tasks}/{total_tasks} tasks overdue. Consider reviewing project timeline.",
                        "icon": "⚠️",
                        "timestamp": timezone.now().isoformat()
                    })
                
                upcoming_tasks = tasks.filter(
                    due_date__gte=now,
                    due_date__lte=now + timedelta(days=3),
                    status__in=["pending", "in_progress"]
                ).count()
                
                if upcoming_tasks > 0:
                    alerts.append({
                        "project_id": project.id,
                        "project_name": project.name,
                        "severity": "info",
                        "message": f"📅 {upcoming_tasks} tasks due in next 3 days. Prepare for upcoming deadlines.",
                        "icon": "📅",
                        "timestamp": timezone.now().isoformat()
                    })
            
            return Response({"alerts": alerts})
            
        except Exception as e:
            logger.error(f"AI Alert error: {e}")
            return Response({"error": str(e)}, status=500)


# ==================== ⚡ APPLY RECOMMENDATION ====================

class ApplyRecommendationView(APIView):
    """Apply a recommendation to the project."""
    permission_classes = [IsAuthenticated, IsProjectManagerOrAdmin]

    def post(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)
            self.check_object_permissions(request, project)
            
            action = request.data.get("action")
            task_id = request.data.get("task_id")
            
            if action == "reassign_task":
                if not task_id:
                    return Response({"error": "task_id required"}, status=400)
                try:
                    task = Task.objects.get(id=task_id, project=project)
                except Task.DoesNotExist:
                    return Response({"error": "Task not found"}, status=404)
                    
                new_user_id = request.data.get("new_user_id")
                if not new_user_id:
                    return Response({"error": "new_user_id required"}, status=400)
                try:
                    new_user = User.objects.get(id=new_user_id)
                except User.DoesNotExist:
                    return Response({"error": "User not found"}, status=404)
                
                task.assigned_to = new_user
                task.save()
                
                return Response({
                    "status": "success",
                    "message": f"✅ Task '{task.title}' reassigned to {new_user.username}"
                })
                
            elif action == "extend_deadline":
                if not task_id:
                    return Response({"error": "task_id required"}, status=400)
                try:
                    task = Task.objects.get(id=task_id, project=project)
                except Task.DoesNotExist:
                    return Response({"error": "Task not found"}, status=404)
                    
                new_days = request.data.get("new_days", 3)
                task.due_date = timezone.now().date() + timedelta(days=new_days)
                task.save()
                
                return Response({
                    "status": "success",
                    "message": f"✅ Task '{task.title}' deadline extended by {new_days} days"
                })
                
            elif action == "set_priority":
                if not task_id:
                    return Response({"error": "task_id required"}, status=400)
                try:
                    task = Task.objects.get(id=task_id, project=project)
                except Task.DoesNotExist:
                    return Response({"error": "Task not found"}, status=404)
                    
                new_priority = request.data.get("new_priority")
                if new_priority not in ["low", "medium", "high"]:
                    return Response({"error": "Invalid priority. Must be low, medium, or high"}, status=400)
                
                task.priority = new_priority
                task.save()
                
                return Response({
                    "status": "success",
                    "message": f"✅ Task '{task.title}' priority set to {new_priority}"
                })
            
            return Response({"error": f"Invalid action: {action}"}, status=400)
            
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=404)
        except Exception as e:
            logger.error(f"Apply recommendation error: {e}")
            return Response({"error": str(e)}, status=500)
def build_insights_response(self, ai_summary, completion_rate, overdue_count, active_projects,
                           ai_predictions, projects_at_risk, ai_recommendations, overloaded_users,
                           is_manager=False):
    """Build the insights response with structured format."""
    
    # Build the insights list
    insights_list = [
        {
            "id": 1, 
            "title": "AI Summary", 
            "body": ai_summary, 
            "type": "summary", 
            "icon": "📊",
            "confidence": 92,
        },
        {
            "id": 2, 
            "title": "Completion Rate", 
            "body": f"{completion_rate:.1f}% of tasks completed.", 
            "type": "summary", 
            "icon": "📈",
            "confidence": 95,
        },
        {
            "id": 3, 
            "title": "Overdue Tasks", 
            "body": f"{overdue_count} tasks are overdue.", 
            "type": "summary", 
            "icon": "⚠️",
            "confidence": 90,
        },
        {
            "id": 4, 
            "title": "Active Projects", 
            "body": f"{active_projects} projects currently active.", 
            "type": "summary", 
            "icon": "📁",
            "confidence": 88,
        },
        {
            "id": 5, 
            "title": "Risk Prediction", 
            "body": ai_predictions, 
            "type": "prediction", 
            "icon": "🔮",
            "confidence": 78,
        },
        {
            "id": 6, 
            "title": "Project Delay Risk", 
            "body": f"{len(projects_at_risk)} project(s) at risk of delay.", 
            "type": "prediction", 
            "icon": "⏰",
            "confidence": 75,
        },
        {
            "id": 7, 
            "title": "Workload Balance", 
            "body": ai_recommendations, 
            "type": "recommendation", 
            "icon": "⚖️",
            "confidence": 82,
        },
        {
            "id": 8, 
            "title": "Team Capacity", 
            "body": f"Team has {len(overloaded_users)} overloaded member(s).", 
            "type": "recommendation", 
            "icon": "👥",
            "confidence": 80,
        },
    ]
    
    # Return structured response
    return Response({
        "project": {
            "id": 0,
            "name": "All Projects" if not is_manager else "Your Projects",
            "status": "active",
        },
        "metrics": {
            "total_tasks": 0,  # These will be filled from context
            "completed_tasks": 0,
            "overdue_tasks": overdue_count,
            "in_progress_tasks": 0,
            "pending_tasks": 0,
            "completion_rate": completion_rate,
            "high_priority": 0,
        },
        "workload": {
            "team_members": [],
            "overloaded_members": overloaded_users,
            "total_team_members": 0,
            "team_health": "good" if len(overloaded_users) == 0 else "fair",
        },
        "ai_insights": {
            "summary": ai_summary,
            "risks": ai_predictions,
            "recommendations": ai_recommendations,
            "generated_at": datetime.now().isoformat(),
        },
        "insights": insights_list,  # ✅ Keep the list for backward compatibility
        "recommendations": [
            {
                "id": "rec_1",
                "title": "Address Overdue Tasks",
                "priority": "critical" if overdue_count > 0 else "low",
                "description": f"Complete {overdue_count} overdue tasks",
                "actions": [
                    {
                        "action": "Complete Task",
                        "instruction": f"Focus on completing {overdue_count} overdue tasks immediately."
                    }
                ] if overdue_count > 0 else []
            },
            {
                "id": "rec_2",
                "title": "Balance Team Workload",
                "priority": "high" if len(overloaded_users) > 0 else "low",
                "description": f"Reassign tasks from {len(overloaded_users)} overloaded team members",
                "actions": [
                    {
                        "action": "Reassign Task",
                        "instruction": f"Redistribute tasks from {', '.join([u['username'] for u in overloaded_users[:3]])}."
                    }
                ] if len(overloaded_users) > 0 else []
            }
        ]
    })