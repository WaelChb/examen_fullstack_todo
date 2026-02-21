from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Category, Task
from .serializers import CategorySerializer, TaskSerializer


@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok'})


@api_view(['GET'])
def debug_sentry(request):
    """Endpoint de test pour vérifier que Sentry capture bien les erreurs."""
    raise Exception("Test Sentry error from Django backend!")


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    http_method_names = ["get", "post"]


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    http_method_names = ["get", "post"]

    def get_queryset(self):
        queryset = Task.objects.select_related("category").order_by("-created_at")
        category_id = self.request.query_params.get("category_id")
        if category_id:
            try:
                queryset = queryset.filter(category_id=int(category_id))
            except (TypeError, ValueError):
                queryset = queryset.none()
        return queryset


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.select_related("category")
    serializer_class = TaskSerializer
    http_method_names = ["get", "patch", "delete"]
