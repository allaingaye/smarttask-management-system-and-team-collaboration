# analytics/urls.py
from django.urls import path
from .views import AnalyticsView, ManagerAnalyticsView, AnalyticsExportView

app_name = 'analytics'

urlpatterns = [
    path('', AnalyticsView.as_view(), name='analytics'),
    path('manager/', ManagerAnalyticsView.as_view(), name='manager-analytics'),
    path('export/', AnalyticsExportView.as_view(), name='analytics-export'),
]