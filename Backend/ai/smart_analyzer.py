# ai/smart_analyzer.py
"""
Smart Project Analyzer - Advanced AI Insights Engine
Senior Software Engineer Level Implementation

This module analyzes project data to generate:
- Smart summaries with context
- Risk assessments with reasoning
- Actionable recommendations with specific tasks and team members
- Team workload analysis
- Predictive insights
"""

import logging
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field

from django.db.models import Q, Count, Avg
from django.utils import timezone

logger = logging.getLogger(__name__)


@dataclass
class TaskInsight:
    """Structured task insight data"""
    task_id: int
    title: str
    status: str
    priority: str
    assignee: Optional[str]
    due_date: Optional[datetime]
    days_overdue: int = 0
    days_stalled: int = 0
    is_blocked: bool = False
    is_high_priority: bool = False
    recommendation: str = ""


@dataclass
class TeamMemberInsight:
    """Structured team member insight data"""
    username: str
    user_id: int
    active_tasks: int = 0
    completed_tasks: int = 0
    urgent_tasks: int = 0
    capacity_used: float = 0.0
    status: str = "balanced"  # available, balanced, busy, overloaded
    specific_tasks: List[Dict] = field(default_factory=list)


@dataclass
class ProjectAnalysis:
    """Complete project analysis result"""
    project_name: str
    project_status: str
    project_end_date: Optional[datetime]
    
    # Metrics
    total_tasks: int = 0
    completed_tasks: int = 0
    in_progress_tasks: int = 0
    pending_tasks: int = 0
    overdue_tasks: int = 0
    high_priority_tasks: int = 0
    completion_rate: float = 0.0
    
    # Detailed analysis
    task_patterns: Dict = field(default_factory=dict)
    team_workload: List[TeamMemberInsight] = field(default_factory=list)
    bottlenecks: List[Dict] = field(default_factory=list)
    deadline_risks: Dict = field(default_factory=dict)
    dependencies: Dict = field(default_factory=dict)
    
    # Generated insights
    summary: str = ""
    risks: List[Dict] = field(default_factory=list)
    recommendations: List[Dict] = field(default_factory=list)
    team_insights: Dict = field(default_factory=dict)
    predictions: List[Dict] = field(default_factory=dict)
    
    # Raw data for OpenAI enhancement
    raw_context: Dict = field(default_factory=dict)


class SmartProjectAnalyzer:
    """
    Advanced project analysis engine with multi-layer intelligence.
    
    Architecture:
    ┌──────────────────────────────────────────────────────────┐
    │              ANALYSIS PIPELINE                          │
    ├──────────────────────────────────────────────────────────┤
    │ Layer 1: Data Processing & Normalization                │
    │   → Parse tasks, members, project metadata              │
    │   → Validate data integrity                             │
    ├──────────────────────────────────────────────────────────┤
    │ Layer 2: Pattern Detection                              │
    │   → Task patterns (stalled, blocked, high-velocity)     │
    │   → Team workload patterns                              │
    │   → Deadline patterns                                   │
    │   → Dependency patterns                                 │
    ├──────────────────────────────────────────────────────────┤
    │ Layer 3: Risk Assessment                                │
    │   → Overdue tasks                                       │
    │   → Stalled tasks                                       │
    │   → Workload imbalance                                  │
    │   → Upcoming deadlines                                  │
    │   → Dependency blockers                                 │
    ├──────────────────────────────────────────────────────────┤
    │ Layer 4: Insight Generation                             │
    │   → Structured summaries                                │
    │   → Actionable recommendations                          │
    │   → Team insights                                       │
    │   → Predictive insights                                 │
    ├──────────────────────────────────────────────────────────┤
    │ Layer 5: Context Building for AI Enhancement            │
    │   → Rich context for OpenAI                             │
    │   → Specific task/team references                       │
    └──────────────────────────────────────────────────────────┘
    """
    
    def __init__(self, project, tasks, members):
        """
        Initialize the analyzer with project data.
        
        Args:
            project: Project model instance
            tasks: QuerySet of Task model instances
            members: QuerySet of User model instances
        """
        self.project = project
        self.tasks = tasks
        self.members = members
        self.analysis = ProjectAnalysis(
            project_name=project.name,
            project_status=project.status,
            project_end_date=project.end_date,
        )
        self.now = timezone.now().date()
        
    def analyze(self) -> ProjectAnalysis:
        """
        Run the full analysis pipeline.
        
        Returns:
            ProjectAnalysis: Complete analysis with insights
        """
        logger.info(f"🔍 Starting smart analysis for project: {self.project.name}")
        
        try:
            # Phase 1: Data Processing
            self._process_metrics()
            
            # Phase 2: Pattern Detection
            self._analyze_task_patterns()
            self._analyze_team_workload()
            
            # Phase 3: Risk Assessment
            self._analyze_bottlenecks()
            self._analyze_deadline_risks()
            self._analyze_dependencies()
            
            # Phase 4: Insight Generation
            self._generate_summary()
            self._generate_risks()
            self._generate_recommendations()
            self._generate_team_insights()
            self._generate_predictions()
            
            # Phase 5: Context Building
            self._build_context_for_ai()
            
            logger.info(f"✅ Analysis complete: {self.analysis.total_tasks} tasks, "
                       f"{len(self.analysis.team_workload)} team members")
            
        except Exception as e:
            logger.error(f"❌ Analysis failed: {e}")
            raise
        
        return self.analysis
    
    # ================================================================
    # PHASE 1: DATA PROCESSING
    # ================================================================
    
    def _process_metrics(self):
        """Process basic project metrics."""
        total = self.tasks.count()
        completed = self.tasks.filter(status="completed").count()
        in_progress = self.tasks.filter(status="in_progress").count()
        pending = self.tasks.filter(status="pending").count()
        overdue = self.tasks.filter(
            due_date__lt=self.now,
            status__in=["pending", "in_progress"]
        ).count()
        high_priority = self.tasks.filter(
            priority="high",
            status__in=["pending", "in_progress"]
        ).count()
        
        self.analysis.total_tasks = total
        self.analysis.completed_tasks = completed
        self.analysis.in_progress_tasks = in_progress
        self.analysis.pending_tasks = pending
        self.analysis.overdue_tasks = overdue
        self.analysis.high_priority_tasks = high_priority
        self.analysis.completion_rate = round(
            (completed / total * 100) if total > 0 else 0, 1
        )
    
    # ================================================================
    # PHASE 2: PATTERN DETECTION
    # ================================================================
    
    def _analyze_task_patterns(self):
        """Analyze task patterns including blocked and stalled tasks."""
        patterns = {
            "by_status": defaultdict(int),
            "by_priority": defaultdict(int),
            "by_age": defaultdict(int),
            "blocked": [],
            "stalled": [],
            "high_velocity": [],
        }
        
        for task in self.tasks:
            # Status distribution
            patterns["by_status"][task.status] += 1
            
            # Priority distribution
            patterns["by_priority"][task.priority] += 1
            
            # Age analysis
            if hasattr(task, 'created_at'):
                age = (self.now - task.created_at.date()).days
                if age > 14:
                    patterns["by_age"]["stale"] += 1
                elif age > 7:
                    patterns["by_age"]["aging"] += 1
                else:
                    patterns["by_age"]["fresh"] += 1
            
            # Identify blocked tasks (keywords in description)
            if task.status != "completed" and task.description:
                blocked_keywords = ["blocked", "waiting", "dependency", "stuck", "delayed"]
                if any(kw in task.description.lower() for kw in blocked_keywords):
                    patterns["blocked"].append({
                        "id": task.id,
                        "title": task.title,
                        "assignee": task.assigned_to.username if task.assigned_to else None,
                        "reason": "Blocked by external dependency",
                    })
            
            # Identify stalled tasks (in progress for > 5 days without update)
            if task.status == "in_progress" and hasattr(task, 'updated_at'):
                days_in_progress = (self.now - task.updated_at.date()).days
                if days_in_progress > 5:
                    patterns["stalled"].append({
                        "id": task.id,
                        "title": task.title,
                        "assignee": task.assigned_to.username if task.assigned_to else None,
                        "days": days_in_progress,
                    })
        
        self.analysis.task_patterns = dict(patterns)
    
    def _analyze_team_workload(self):
        """Analyze team workload with capacity metrics."""
        workload = []
        
        for member in self.members:
            active_tasks = self.tasks.filter(
                assigned_to=member,
                status__in=["pending", "in_progress"]
            )
            
            completed_tasks = self.tasks.filter(
                assigned_to=member,
                status="completed"
            )
            
            # Urgent tasks (due in 3 days)
            urgent_tasks = active_tasks.filter(
                due_date__lte=self.now + timedelta(days=3)
            )
            
            active_count = active_tasks.count()
            completed_count = completed_tasks.count()
            urgent_count = urgent_tasks.count()
            
            # Capacity: 3 active tasks = 100% capacity
            capacity_used = min((active_count / 3) * 100, 100)
            
            # Workload status
            if active_count == 0:
                status = "available"
            elif active_count <= 2:
                status = "balanced"
            elif active_count <= 4:
                status = "busy"
            else:
                status = "overloaded"
            
            workload.append(TeamMemberInsight(
                username=member.username,
                user_id=member.id,
                active_tasks=active_count,
                completed_tasks=completed_count,
                urgent_tasks=urgent_count,
                capacity_used=capacity_used,
                status=status,
                specific_tasks=[
                    {"title": t.title, "priority": t.priority, "due": t.due_date}
                    for t in active_tasks[:5]
                ]
            ))
        
        # Sort by workload (most busy first)
        workload.sort(key=lambda x: x.capacity_used, reverse=True)
        self.analysis.team_workload = workload
        
        # Detect workload imbalance
        if workload:
            max_load = workload[0].capacity_used
            min_load = workload[-1].capacity_used
            self.analysis.raw_context["workload_imbalance"] = max_load - min_load > 30
    
    # ================================================================
    # PHASE 3: RISK ASSESSMENT
    # ================================================================
    
    def _analyze_bottlenecks(self):
        """Identify bottlenecks in the workflow."""
        bottlenecks = []
        
        # Check for stalled tasks
        for stalled in self.analysis.task_patterns.get("stalled", []):
            bottlenecks.append({
                "type": "stalled_task",
                "task_id": stalled["id"],
                "task_title": stalled["title"],
                "assignee": stalled.get("assignee", "Unassigned"),
                "days_stalled": stalled["days"],
                "severity": "high" if stalled["days"] > 7 else "medium",
                "recommendation": "Schedule a sync to unblock and identify blockers"
            })
        
        # Check for blocked tasks
        for blocked in self.analysis.task_patterns.get("blocked", []):
            bottlenecks.append({
                "type": "blocked_task",
                "task_id": blocked["id"],
                "task_title": blocked["title"],
                "assignee": blocked.get("assignee", "Unassigned"),
                "reason": blocked["reason"],
                "severity": "high",
                "recommendation": "Escalate blocker to management"
            })
        
        # Check for unassigned high-priority tasks
        unassigned_high = self.tasks.filter(
            assigned_to__isnull=True,
            priority="high",
            status__in=["pending", "in_progress"]
        )
        for task in unassigned_high:
            bottlenecks.append({
                "type": "unassigned_high_priority",
                "task_id": task.id,
                "task_title": task.title,
                "severity": "high",
                "recommendation": f"Assign '{task.title}' to a team member immediately"
            })
        
        self.analysis.bottlenecks = bottlenecks
    
    def _analyze_deadline_risks(self):
        """Analyze deadline-related risks."""
        risks = []
        
        for task in self.tasks:
            if not task.due_date or task.status == "completed":
                continue
            
            days_until_due = (task.due_date - self.now).days
            
            if days_until_due < 0:
                # Overdue
                risks.append({
                    "task_id": task.id,
                    "task_title": task.title,
                    "type": "overdue",
                    "days_overdue": abs(days_until_due),
                    "assignee": task.assigned_to.username if task.assigned_to else "Unassigned",
                    "priority": task.priority,
                    "severity": "critical" if days_until_due < -5 else "high",
                    "recommendation": "Complete immediately and escalate blockers"
                })
            elif days_until_due <= 3:
                # Due soon
                risks.append({
                    "task_id": task.id,
                    "task_title": task.title,
                    "type": "upcoming",
                    "days_until_due": days_until_due,
                    "assignee": task.assigned_to.username if task.assigned_to else "Unassigned",
                    "priority": task.priority,
                    "severity": "high" if task.priority == "high" else "medium",
                    "recommendation": "Prioritize and remove any blockers"
                })
            elif days_until_due <= 7 and task.status == "pending":
                # Unstarted task due next week
                risks.append({
                    "task_id": task.id,
                    "task_title": task.title,
                    "type": "unstarted_near_due",
                    "days_until_due": days_until_due,
                    "assignee": task.assigned_to.username if task.assigned_to else "Unassigned",
                    "severity": "medium",
                    "recommendation": "Start work immediately to avoid last-minute rush"
                })
        
        # Group risks by assignee
        risks_by_assignee = defaultdict(list)
        for risk in risks:
            assignee = risk.get("assignee", "Unassigned")
            risks_by_assignee[assignee].append(risk)
        
        self.analysis.deadline_risks = {
            "all_risks": risks,
            "critical_count": len([r for r in risks if r["severity"] == "critical"]),
            "high_count": len([r for r in risks if r["severity"] == "high"]),
            "by_assignee": dict(risks_by_assignee),
        }
    
    def _analyze_dependencies(self):
        """Analyze task dependencies."""
        dependencies = {
            "blocking": [],
            "blocked_by": [],
        }
        
        for task in self.tasks:
            if task.description:
                # Look for dependency indicators
                lower_desc = task.description.lower()
                if "depends on" in lower_desc or "waiting for" in lower_desc:
                    dependencies["blocked_by"].append({
                        "task_id": task.id,
                        "task_title": task.title,
                        "assignee": task.assigned_to.username if task.assigned_to else "Unassigned",
                    })
                if "blocks" in lower_desc or "prevents" in lower_desc:
                    dependencies["blocking"].append({
                        "task_id": task.id,
                        "task_title": task.title,
                        "assignee": task.assigned_to.username if task.assigned_to else "Unassigned",
                    })
        
        self.analysis.dependencies = dependencies
    
    # ================================================================
    # PHASE 4: INSIGHT GENERATION
    # ================================================================
    
    def _generate_summary(self):
        """Generate a professional, context-aware summary."""
        total = self.analysis.total_tasks
        completed = self.analysis.completed_tasks
        overdue = self.analysis.overdue_tasks
        in_progress = self.analysis.in_progress_tasks
        rate = self.analysis.completion_rate
        
        # Determine project health
        if overdue > 3:
            health = "critical"
            health_icon = "🔴"
            health_text = "At Critical Risk"
        elif overdue > 0:
            health = "warning"
            health_icon = "⚠️"
            health_text = "Needs Immediate Attention"
        elif rate > 70:
            health = "good"
            health_icon = "✅"
            health_text = "On Track"
        else:
            health = "moderate"
            health_icon = "📊"
            health_text = "Progressing"
        
        # Build summary
        summary_lines = [
            f"{health_icon} {health_text} - Project \"{self.project.name}\"",
            "",
            f"📊 Progress: {completed}/{total} tasks completed ({rate}%)",
            f"🔄 In Progress: {in_progress} tasks",
            f"🔴 Overdue: {overdue} tasks",
        ]
        
        # Add context
        if health == "critical":
            summary_lines.append("")
            summary_lines.append(f"🚨 CRITICAL: {overdue} overdue tasks blocking progress. Immediate intervention needed.")
            
            # Mention specific overdue tasks
            overdue_tasks = self.analysis.deadline_risks.get("all_risks", [])
            overdue_titles = [t["task_title"] for t in overdue_tasks if t["type"] == "overdue"][:3]
            if overdue_titles:
                summary_lines.append(f"   Overdue: {', '.join(overdue_titles)}")
            
        elif health == "warning":
            summary_lines.append("")
            summary_lines.append(f"⚠️ {overdue} overdue tasks require immediate attention.")
            
        elif health == "good":
            summary_lines.append("")
            summary_lines.append(f"✨ Excellent progress! Team maintaining good velocity at {rate}% completion.")
            
        else:
            summary_lines.append("")
            summary_lines.append(f"📈 Moderate progress with room for improvement. Focus on completing pending tasks.")
        
        # Add team context
        overloaded = [m.username for m in self.analysis.team_workload if m.status == "overloaded"]
        if overloaded:
            summary_lines.append("")
            names = ', '.join(overloaded[:3])
            summary_lines.append(f"👥 {names} {'is' if len(overloaded) == 1 else 'are'} overloaded - consider redistributing work.")
        
        self.analysis.summary = '\n'.join(summary_lines)
    
    def _generate_risks(self):
        """Generate structured risk assessment."""
        risks = []
        
        # 1. Overdue tasks
        overdue_risks = [
            r for r in self.analysis.deadline_risks.get("all_risks", [])
            if r["type"] == "overdue"
        ]
        if overdue_risks:
            risk_text = "🔴 **Critical: Overdue Tasks**\n"
            for risk in overdue_risks[:3]:
                risk_text += f"  • \"{risk['task_title']}\" overdue by {risk['days_overdue']} days (Assignee: {risk['assignee']})\n"
            risks.append({
                "type": "overdue",
                "severity": "critical",
                "message": risk_text,
                "affected_tasks": overdue_risks,
            })
        
        # 2. Stalled tasks
        stalled = self.analysis.bottlenecks
        stalled_tasks = [s for s in stalled if s["type"] == "stalled_task"]
        if stalled_tasks:
            stalled_text = "⏳ **Stalled Tasks**\n"
            for s in stalled_tasks[:3]:
                stalled_text += f"  • \"{s['task_title']}\" stalled for {s['days_stalled']} days (Assignee: {s['assignee']})\n"
            risks.append({
                "type": "stalled",
                "severity": "high",
                "message": stalled_text,
                "affected_tasks": stalled_tasks,
            })
        
        # 3. Workload imbalance
        if self.analysis.raw_context.get("workload_imbalance", False):
            workload_text = "⚖️ **Workload Imbalance Detected**\n"
            for member in self.analysis.team_workload[:3]:
                status_emoji = "🔴" if member.status == "overloaded" else "🟡" if member.status == "busy" else "🟢"
                workload_text += f"  • {status_emoji} {member.username}: {member.active_tasks} active tasks ({member.capacity_used:.0f}% capacity)\n"
            risks.append({
                "type": "workload_imbalance",
                "severity": "high",
                "message": workload_text,
            })
        
        # 4. Upcoming deadlines
        upcoming = [
            r for r in self.analysis.deadline_risks.get("all_risks", [])
            if r["type"] == "upcoming"
        ]
        if upcoming:
            upcoming_text = "📅 **Upcoming Deadlines (Next 3 Days)**\n"
            for risk in upcoming[:3]:
                upcoming_text += f"  • \"{risk['task_title']}\" due in {risk['days_until_due']} days (Priority: {risk['priority']})\n"
            risks.append({
                "type": "upcoming_deadlines",
                "severity": "high" if any(r["priority"] == "high" for r in upcoming) else "medium",
                "message": upcoming_text,
            })
        
        # 5. Blocked tasks
        blocked = [s for s in stalled if s["type"] == "blocked_task"]
        if blocked:
            blocked_text = "🚧 **Blocked Tasks**\n"
            for b in blocked[:3]:
                blocked_text += f"  • \"{b['task_title']}\" - {b.get('reason', 'Blocked')} (Assignee: {b['assignee']})\n"
            risks.append({
                "type": "blocked",
                "severity": "high",
                "message": blocked_text,
                "affected_tasks": blocked,
            })
        
        self.analysis.risks = risks
    
    def _generate_recommendations(self):
        """Generate actionable, specific recommendations."""
        recommendations = []
        
        # 1. Clear Overdue Tasks
        overdue_risks = [
            r for r in self.analysis.deadline_risks.get("all_risks", [])
            if r["type"] == "overdue"
        ]
        if overdue_risks:
            rec = {
                "id": f"rec_overdue_{int(datetime.now().timestamp())}",
                "title": "🚨 Clear Overdue Tasks",
                "priority": "critical",
                "description": f"Complete {len(overdue_risks)} overdue tasks immediately",
                "actions": [],
            }
            
            for risk in overdue_risks[:3]:
                rec["actions"].append({
                    "action": "Complete Task",
                    "task_id": risk["task_id"],
                    "task_title": risk["task_title"],
                    "assignee": risk["assignee"],
                    "instruction": f"Complete '{risk['task_title']}' today. {risk.get('recommendation', 'Focus on this task.')}",
                })
            
            # Suggest reassignment if assignee is overloaded
            for risk in overdue_risks[:3]:
                assignee = risk["assignee"]
                for member in self.analysis.team_workload:
                    if member.username == assignee and member.status == "overloaded":
                        available = [m for m in self.analysis.team_workload if m.status in ["available", "balanced"]]
                        if available:
                            rec["actions"].append({
                                "action": "Reassign Task",
                                "task_id": risk["task_id"],
                                "task_title": risk["task_title"],
                                "from": assignee,
                                "to": available[0].username,
                                "instruction": f"Reassign '{risk['task_title']}' from {assignee} to {available[0].username} to balance workload",
                            })
            
            recommendations.append(rec)
        
        # 2. Unblock Stalled Tasks
        stalled_tasks = [s for s in self.analysis.bottlenecks if s["type"] == "stalled_task"]
        if stalled_tasks:
            rec = {
                "id": f"rec_stalled_{int(datetime.now().timestamp())}",
                "title": "⏳ Unblock Stalled Work",
                "priority": "high",
                "description": f"Address {len(stalled_tasks)} stalled tasks",
                "actions": [],
            }
            
            for s in stalled_tasks[:3]:
                rec["actions"].append({
                    "action": "Review and Unblock",
                    "task_id": s["task_id"],
                    "task_title": s["task_title"],
                    "assignee": s["assignee"],
                    "instruction": f"Schedule a sync with {s['assignee']} to unblock '{s['task_title']}' - stalled for {s['days_stalled']} days",
                })
            
            recommendations.append(rec)
        
        # 3. Balance Workload
        if self.analysis.raw_context.get("workload_imbalance", False):
            rec = {
                "id": f"rec_balance_{int(datetime.now().timestamp())}",
                "title": "⚖️ Balance Team Workload",
                "priority": "high",
                "description": "Redistribute tasks to optimize team productivity",
                "actions": [],
            }
            
            overloaded_members = [m for m in self.analysis.team_workload if m.status == "overloaded"]
            available_members = [m for m in self.analysis.team_workload if m.status in ["available", "balanced"]]
            
            for om in overloaded_members[:2]:
                if available_members:
                    tasks_to_reassign = self.tasks.filter(
                        assigned_to__username=om.username,
                        status__in=["pending", "in_progress"]
                    )[:2]
                    
                    for task in tasks_to_reassign:
                        rec["actions"].append({
                            "action": "Reassign Task",
                            "task_id": task.id,
                            "task_title": task.title,
                            "from": om.username,
                            "to": available_members[0].username,
                            "instruction": f"Reassign '{task.title}' from {om.username} to {available_members[0].username} to balance workload",
                        })
            
            if rec["actions"]:
                recommendations.append(rec)
        
        # 4. Focus on High-Priority Tasks
        high_priority_tasks = self.tasks.filter(
            priority="high",
            status__in=["pending", "in_progress"]
        )
        if high_priority_tasks.exists():
            rec = {
                "id": f"rec_high_priority_{int(datetime.now().timestamp())}",
                "title": "🎯 Focus on High-Priority Work",
                "priority": "high",
                "description": f"Complete {high_priority_tasks.count()} high-priority tasks",
                "actions": [],
            }
            
            for task in high_priority_tasks[:3]:
                rec["actions"].append({
                    "action": "Prioritize Task",
                    "task_id": task.id,
                    "task_title": task.title,
                    "assignee": task.assigned_to.username if task.assigned_to else "Unassigned",
                    "instruction": f"Ensure '{task.title}' is completed before other work. Block time for this task.",
                })
            
            recommendations.append(rec)
        
        # 5. Proactive Planning (if no other recommendations)
        if not recommendations:
            recommendations.append({
                "id": f"rec_proactive_{int(datetime.now().timestamp())}",
                "title": "🚀 Maintain Momentum",
                "priority": "low",
                "description": "Project is on track - focus on maintaining velocity",
                "actions": [
                    {
                        "action": "Review Weekly Goals",
                        "instruction": "Hold a 15-min sync to align on weekly goals",
                    },
                    {
                        "action": "Celebrate Wins",
                        "instruction": "Recognize team achievements to maintain morale",
                    }
                ],
            })
        
        self.analysis.recommendations = recommendations
    
    def _generate_team_insights(self):
        """Generate team-specific insights."""
        team_insights = {
            "top_performers": [],
            "needs_support": [],
            "workload_distribution": {},
            "team_health": "good",
        }
        
        for member in self.analysis.team_workload:
            # Top performers (completed > 5 tasks)
            if member.completed_tasks > 5:
                team_insights["top_performers"].append({
                    "username": member.username,
                    "completed": member.completed_tasks,
                    "active": member.active_tasks,
                })
            
            # Needs support (overloaded or > 5 active tasks)
            if member.status == "overloaded" or member.active_tasks > 5:
                team_insights["needs_support"].append({
                    "username": member.username,
                    "active_tasks": member.active_tasks,
                    "urgent_tasks": member.urgent_tasks,
                })
        
        # Overall team health
        overloaded_count = len(team_insights["needs_support"])
        if overloaded_count > len(self.analysis.team_workload) * 0.4:
            team_insights["team_health"] = "poor"
        elif overloaded_count > 0:
            team_insights["team_health"] = "fair"
        else:
            team_insights["team_health"] = "good"
        
        self.analysis.team_insights = team_insights
    
    def _generate_predictions(self):
        """Generate predictive insights."""
        predictions = []
        
        # Project completion prediction
        total = self.analysis.total_tasks
        completed = self.analysis.completed_tasks
        remaining = total - completed
        
        if remaining > 0:
            # Calculate daily velocity (tasks completed per day)
            # For demo: assume project started 30 days ago
            days_active = 30
            daily_rate = completed / days_active if completed > 0 else 0.5
            
            if daily_rate > 0:
                days_to_complete = remaining / daily_rate
                predicted_date = self.now + timedelta(days=int(days_to_complete))
                
                # Check if prediction is realistic
                if self.analysis.project_end_date:
                    end_date = self.analysis.project_end_date
                    if predicted_date > end_date:
                        days_over = (predicted_date - end_date).days
                        predictions.append({
                            "type": "completion_risk",
                            "prediction": f"⚠️ Project may be delayed by {days_over} days at current pace",
                            "confidence": "medium",
                            "details": f"Based on current velocity of {daily_rate:.1f} tasks/day, remaining {remaining} tasks will take ~{int(days_to_complete)} days",
                        })
                    else:
                        days_early = (end_date - predicted_date).days
                        predictions.append({
                            "type": "on_track",
                            "prediction": f"✅ Project likely to complete {days_early} days ahead of schedule",
                            "confidence": "high",
                            "details": f"Based on current velocity of {daily_rate:.1f} tasks/day",
                        })
                else:
                    predictions.append({
                        "type": "estimated_completion",
                        "prediction": f"📅 Estimated completion: {predicted_date.strftime('%Y-%m-%d')}",
                        "confidence": "medium",
                        "details": f"Based on current velocity of {daily_rate:.1f} tasks/day",
                    })
        
        # Team burnout prediction
        overloaded = len([m for m in self.analysis.team_workload if m.status == "overloaded"])
        if overloaded > 0:
            predictions.append({
                "type": "team_health",
                "prediction": f"⚠️ {overloaded} team member(s) at risk of burnout",
                "confidence": "medium",
                "details": "Consider redistributing tasks and checking in with overloaded members",
            })
        
        # Risk of missing deadlines
        critical_risks = len([r for r in self.analysis.risks if r.get("severity") == "critical"])
        if critical_risks > 0:
            predictions.append({
                "type": "deadline_risk",
                "prediction": f"🔴 {critical_risks} critical risks identified - high probability of deadline issues",
                "confidence": "high",
                "details": "Immediate action required to mitigate risks",
            })
        
        self.analysis.predictions = predictions
    
    # ================================================================
    # PHASE 5: CONTEXT BUILDING FOR AI
    # ================================================================
    
    def _build_context_for_ai(self):
        """Build rich context for OpenAI enhancement."""
        context = {
            "project": {
                "name": self.project.name,
                "status": self.project.status,
                "end_date": self.project.end_date,
            },
            "metrics": {
                "total_tasks": self.analysis.total_tasks,
                "completed_tasks": self.analysis.completed_tasks,
                "overdue_tasks": self.analysis.overdue_tasks,
                "completion_rate": self.analysis.completion_rate,
            },
            "tasks": {
                "overdue": [
                    {"title": r["task_title"], "assignee": r["assignee"]}
                    for r in self.analysis.deadline_risks.get("all_risks", [])
                    if r["type"] == "overdue"
                ][:5],
                "high_priority": [
                    {"title": t.title, "assignee": t.assigned_to.username if t.assigned_to else None}
                    for t in self.tasks.filter(priority="high", status__in=["pending", "in_progress"])
                ][:5],
                "stalled": [
                    {"title": s["task_title"], "assignee": s["assignee"], "days": s["days_stalled"]}
                    for s in self.analysis.bottlenecks if s["type"] == "stalled_task"
                ][:3],
            },
            "team": {
                "overloaded": [
                    {"username": m.username, "tasks": m.active_tasks}
                    for m in self.analysis.team_workload if m.status == "overloaded"
                ],
                "available": [
                    {"username": m.username}
                    for m in self.analysis.team_workload if m.status == "available"
                ],
            },
        }
        self.analysis.raw_context = context
    
    # ================================================================
    # UTILITY METHODS
    # ================================================================
    
    def get_insights_summary(self) -> Dict:
        """Get a concise summary of all insights."""
        return {
            "project": self.analysis.project_name,
            "status": self.analysis.project_status,
            "metrics": {
                "total_tasks": self.analysis.total_tasks,
                "completed_tasks": self.analysis.completed_tasks,
                "completion_rate": self.analysis.completion_rate,
                "overdue_tasks": self.analysis.overdue_tasks,
            },
            "summary": self.analysis.summary,
            "risk_count": len(self.analysis.risks),
            "recommendation_count": len(self.analysis.recommendations),
            "team_health": self.analysis.team_insights.get("team_health", "unknown"),
        }
    
    def get_openai_prompt(self) -> str:
        """
        Build a rich prompt for OpenAI enhancement.
        This is used by the view to get AI-polished insights.
        """
        context = self.analysis.raw_context
        
        prompt = f"""
PROJECT CONTEXT:
- Name: {context['project']['name']}
- Status: {context['project']['status']}
- End Date: {context['project']['end_date']}

METRICS:
- Total Tasks: {context['metrics']['total_tasks']}
- Completed: {context['metrics']['completed_tasks']}
- Completion Rate: {context['metrics']['completion_rate']}%
- Overdue Tasks: {context['metrics']['overdue_tasks']}

TASK DETAILS:
"""
        if context['tasks']['overdue']:
            prompt += "Overdue Tasks:\n"
            for t in context['tasks']['overdue']:
                prompt += f"  - {t['title']} (Assignee: {t['assignee']})\n"
        
        if context['tasks']['high_priority']:
            prompt += "High-Priority Tasks:\n"
            for t in context['tasks']['high_priority']:
                prompt += f"  - {t['title']} (Assignee: {t['assignee']})\n"
        
        if context['tasks']['stalled']:
            prompt += "Stalled Tasks:\n"
            for t in context['tasks']['stalled']:
                prompt += f"  - {t['title']} (Stalled for {t['days']} days, Assignee: {t['assignee']})\n"

        prompt += f"""
TEAM WORKLOAD:
- Overloaded Members: {', '.join([m['username'] for m in context['team']['overloaded']]) if context['team']['overloaded'] else 'None'}
- Available Members: {', '.join([m['username'] for m in context['team']['available']]) if context['team']['available'] else 'None'}

Based on this data, provide a professional project analysis including:
1. Executive Summary (2-3 sentences)
2. Key Risks with reasoning (2-3)
3. Actionable Recommendations (2-3) - mention specific tasks and team members
4. Team Health Assessment (1-2 sentences)

Be specific, data-driven, and professional. Use a senior project manager tone.
"""
        return prompt