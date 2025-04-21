# tools/serializers.py
# -----------------------------------
# سریالایزرها برای تبدیل مدل‌ها به JSON (برای API)
# -----------------------------------

from django.db.models import Avg
from rest_framework import serializers
from .models import Tool, Category, Technology, ToolReview, Tag, ReviewReaction  # 📌 همه مدل‌ها رو با هم ایمپورت کن
      
# ✅ Serializer برای ثبت نظرات کاربران
class ToolReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    tool_name = serializers.CharField(source="tool.name", read_only=True)
    replies = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()

    def get_my_reaction(self, obj):
        user = self.context["request"].user
        if user.is_authenticated:
            reaction = obj.reactions.filter(user=user).first()
            return reaction.type if reaction else None
        return None


    def get_like_count(self, obj):
        return obj.reactions.filter(type='like').count()

    def get_dislike_count(self, obj):
        return obj.reactions.filter(type='dislike').count()

    def get_replies(self, obj):
        children = obj.replies.all().order_by("created_at")
        return ToolReviewSerializer(children, many=True, context=self.context).data

    class Meta:
        model = ToolReview
        fields = [
            "id", "tool", "tool_name", "user", "rating", "comment",
            "created_at", "updated_at", "replies", "parent", "like_count", "dislike_count", 
            "my_reaction"
        ]
        read_only_fields = [
            "id", "user", "created_at", "updated_at",
            "tool_name", "tool", "parent"
        ]


# 🎯 Serializer برای تگ
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']
        
    def validate_name(self, value):
        # 🔍 اطمینان از نرمال‌سازی در ورودی
        cleaned = value.strip().lower()
        if Tag.objects.filter(name=cleaned).exists():
            raise serializers.ValidationError("تگی با این نام قبلاً ثبت شده است.")
        return cleaned

# ✅ سریالایزر ابزارها
class ToolSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()  # ⭐ فیلد محاسبه‌شونده
    reviews = ToolReviewSerializer(many=True, read_only=True)  # 👈 نمایش همه نظرات ابزار
    tags = TagSerializer(many=True, read_only=True)  # نمایش تگ‌ها
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        write_only=True,
        required=False
    )  # 🔹 این فقط برای ورودی استفاده میشه، نه نمایش
    
    class Meta:
        model = Tool
        fields = '__all__'  # تمام فیلدهای مدل + average_rating

    
    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        tool = super().create(validated_data)
        tool.tags.set(tag_ids)
        return tool

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        tool = super().update(instance, validated_data)
        if tag_ids is not None:
            tool.tags.set(tag_ids)
        return tool

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else None  # مثلاً 4.5

# ✅ سریالایزر دسته‌بندی‌ها
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

# ✅ سریالایزر تکنولوژی‌ها
class TechnologySerializer(serializers.ModelSerializer):
    class Meta:
        model = Technology
        fields = '__all__'


# ✅ Serializer برای ری‌اکشن نظرات
class ReviewReactionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    # ✅ فیلدهای شمارنده ری‌اکشن‌ها
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()

    def get_like_count(self, obj):
        return obj.reactions.filter(type='like').count()
    
    def get_dislike_count(self, obj):
        return obj.reactions.filter(type='dislike').count()
    
    class Meta:
        model = ReviewReaction
        fields = [
            "id", "tool", "tool_name", "user", "rating", "comment",
            "created_at", "updated_at", "replies", "parent",
            "like_count", "dislike_count",  # 🔥 اینا جدیدن
        ]
        read_only_fields = ['id', 'user', 'created_at']

