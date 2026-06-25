# ai/urls.py
from django.urls import path
from .views import (
    AIInsightsView, 
    ProjectAIInsightsView, 
    ProjectChartsView, 
    AIAlertCheckView,
    ApplyRecommendationView
)

app_name = 'ai'

urlpatterns = [
    # Global AI Insights
    path("insights/", AIInsightsView.as_view(), name="ai-insights"),
    
    # Project-Specific AI Guidance
    path("projects/<int:project_id>/insights/", ProjectAIInsightsView.as_view(), name="project-ai-insights"),
    
    # Project Charts
    path("projects/<int:project_id>/charts/", ProjectChartsView.as_view(), name="project-charts"),
    
    # AI Alerts
    path("alerts/", AIAlertCheckView.as_view(), name="ai-alerts"),
    
    # Apply Recommendation
    path("projects/<int:project_id>/apply/", ApplyRecommendationView.as_view(), name="apply-recommendation"),
]