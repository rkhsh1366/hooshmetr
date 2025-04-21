# tools/filters.py

import django_filters
from django.db.models import Avg, Q
from .models import Tool, Tag

class ToolFilter(django_filters.FilterSet):
    # فیلتر دسته‌بندی بر اساس نام
    category_name = django_filters.CharFilter(field_name='categories__name', lookup_expr='icontains')

    # فیلتر تکنولوژی بر اساس نام
    technology_name = django_filters.CharFilter(field_name='technologies__name', lookup_expr='icontains')

    # 👇 اینجا هر ویژگی جدید فیلترپذیر رو اضافه می‌کنیم:
    has_chatbot = django_filters.BooleanFilter(field_name='has_chatbot')
    multi_language_support = django_filters.BooleanFilter(field_name='multi_language_support')
    desktop_version = django_filters.BooleanFilter(field_name='desktop_version')
    min_rating = django_filters.NumberFilter(method='filter_min_rating', label='میانگین امتیاز حداقل')
    max_rating = django_filters.NumberFilter(method='filter_max_rating', label='میانگین امتیاز حداکثر')
    # 🎯 فیلتر بر اساس تگ
    tag = django_filters.NumberFilter(field_name='tags__id', lookup_expr='exact', label='تگ')

    # 💡 ویژگی ترکیبی OR
    or_features = django_filters.CharFilter(method='filter_or_features')

    
    class Meta:
        model = Tool
        fields = [
            'license_type',
            'supports_farsi',
            'is_sanctioned',
            'category_name',
            'technology_name',
            'has_chatbot',
            'multi_language_support',
            'desktop_version',
            'tag',
        ]
    def filter_min_rating(self, queryset, name, value):
        return queryset.annotate(avg_rating=Avg('reviews__rating')).filter(avg_rating__gte=value)

    def filter_max_rating(self, queryset, name, value):
        return queryset.annotate(avg_rating=Avg('reviews__rating')).filter(avg_rating__lte=value)
    
    def filter_or_features(self, queryset, name, value):
        """
        کاربر (در URL یا فرم) باید مقدار or_features رو این شکلی بده: 

        value باید به صورت comma جدا بشه مثل: supports_farsi,has_chatbot
        یعنی ابزارهایی که یکی از این ویژگی‌ها رو داشته باشن
        """
        conditions = Q()
        for feature in value.split(','):
            if hasattr(Tool, feature):
                conditions |= Q(**{f"{feature}": True})
        return queryset.filter(conditions)