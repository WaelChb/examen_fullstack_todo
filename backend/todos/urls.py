from django.urls import path

from .views import CategoryListCreateView, TaskDetailView, TaskListCreateView


urlpatterns = [
    path("categories/", CategoryListCreateView.as_view(), name="category-list-create"),
    path("tasks/", TaskListCreateView.as_view(), name="task-list-create"),
    path("tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
]
