from rest_framework import serializers

from .models import Category, Task


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]
        extra_kwargs = {"name": {"required": True}}


class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Task
        fields = ["id", "description", "is_completed", "created_at", "category", "category_name"]
        read_only_fields = ["created_at"]
        extra_kwargs = {
            "description": {"required": True},
            "category": {"required": True},
        }
