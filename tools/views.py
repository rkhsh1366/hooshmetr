# tools/views.py
# --------------------------------------------------
# ویوهای API برای ابزار، دسته‌بندی و تکنولوژی
# --------------------------------------------------

# 🧩 ماژول‌های خارجی نصب‌شده
from rest_framework import generics, permissions, filters, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Q

# 🧩 ماژول‌های داخلی پروژه
from .models import Tool, Category, Technology, ToolReview, Tag, ReviewReaction
from .serializers import ToolSerializer, CategorySerializer, TechnologySerializer, ToolReviewSerializer, TagSerializer, ReviewReactionSerializer
from .filters import ToolFilter
from .permissions import IsOwnerOrAdminOrReadOnly, IsAdminUserRole



# ✅ لیست ابزارها + ساخت ابزار جدید (GET + POST)
class ToolListCreateView(generics.ListCreateAPIView):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ToolFilter  # 🔥 فیلتر اختصاصی ما
    search_fields = ['name', 'description']  # فیلدهایی که جستجو توشون انجام میشه
    ordering_fields = ['name', 'id']  # 👈 مرتب‌سازی فقط روی این فیلدها مجازه
    permission_classes = [IsAuthenticatedOrReadOnly]  # 👈 اینو اضافه کن

    # ✅ نمایش اطلاعات یک ابزار خاص + نظراتش + میانگین امتیاز
class ToolDetailView(generics.RetrieveAPIView):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer
    permission_classes = [permissions.AllowAny]  # همه بتونن ببینن


# ✅ لیست دسته‌بندی‌ها + ساخت دسته‌بندی جدید
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

# ✅ لیست تکنولوژی‌ها + ساخت تکنولوژی جدید
class TechnologyListCreateView(generics.ListCreateAPIView):
    queryset = Technology.objects.all()
    serializer_class = TechnologySerializer


# 🔽 نمایش و ثبت نظرات کاربران
class ToolReviewListCreateView(generics.ListCreateAPIView):
    queryset = ToolReview.objects.all()
    serializer_class = ToolReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # 🔒 کاربر جاری به عنوان نویسنده ثبت می‌شود
        serializer.save(user=self.request.user)

    def get_queryset(self):
        queryset = ToolReview.objects.all()

        # 📌 فیلتر بر اساس ابزار
        tool_id = self.request.query_params.get("tool")
        if tool_id:
            queryset = queryset.filter(tool_id=tool_id)

        # 🆕 مرتب‌سازی بر اساس محبوبیت
        ordering = self.request.query_params.get("ordering")
        if ordering == "likes":
            queryset = queryset.annotate(likes=Count("reactions", filter=Q(reactions__type="like"))).order_by("-likes")
        elif ordering == "dislikes":
            queryset = queryset.annotate(dislikes=Count("reactions", filter=Q(reactions__type="dislike"))).order_by("-dislikes")
        else:
            queryset = queryset.order_by("-created_at")  # پیش‌فرض: جدیدترین‌ها

        return queryset


# ✅ ثبت نظر فقط برای یک ابزار خاص توسط کاربر لاگین‌شده
class ToolReviewCreateView(generics.CreateAPIView):
    serializer_class = ToolReviewSerializer
    permission_classes = [IsAuthenticated]  # فقط کاربر لاگین‌شده اجازه داره نظر بده

    def perform_create(self, serializer):
        # دریافت ID ابزار از URL
        tool_id = self.kwargs['tool_id']
        # پیدا کردن شیء ابزار مربوطه
        tool = Tool.objects.get(pk=tool_id)
        # ذخیره نظر همراه با ابزار و کاربر لاگین‌شده
        serializer.save(user=self.request.user, tool=tool)

# ✏️ مشاهده، ویرایش و حذف نظر (فقط توسط صاحبش)
class ToolReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ToolReview.objects.all()
    serializer_class = ToolReviewSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly, IsAuthenticated]  # فقط صاحب اجازه ویرایش/حذف داره


    # 📊 لیست ابزارهایی که امتیاز دارن، مرتب‌شده بر اساس میانگین امتیاز
class TopRatedToolsView(generics.ListAPIView):
    serializer_class = ToolSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Tool.objects.annotate(
            avg_rating=Avg('reviews__rating')  # محاسبه میانگین
        ).filter(
            avg_rating__isnull=False  # فقط ابزارهایی که امتیاز دارن
        ).order_by('-avg_rating')  # مرتب‌سازی نزولی


# 📦 لیست و ساخت تگ جدید
class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

# ✅ ایجاد یا آپدیت ری‌اکشن
class ReviewReactionView(generics.CreateAPIView):
    serializer_class = ReviewReactionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # 🧩 دریافت داده‌ها از درخواست
        review = serializer.validated_data['review']
        type = serializer.validated_data['type']
        user = self.request.user

        # 🔍 بررسی اینکه کاربر قبلاً ری‌اکشن داده یا نه
        existing = ReviewReaction.objects.filter(review=review, user=user).first()

        if existing:
            if existing.type == type:
                # 🔁 اگر قبلاً همون ری‌اکشن داده، پیام خطا بده
                raise ValidationError("قبلاً این ری‌اکشن ثبت شده است.")
            else:
                # 🔁 اگر نوع ری‌اکشن متفاوت باشه، ری‌اکشن قبلی رو آپدیت کن
                existing.type = type
                existing.save()
                raise ValidationError("ری‌اکشن قبلی آپدیت شد.")

        # ✅ ری‌اکشن جدید ثبت بشه
        serializer.save(user=user)


# ✅ آپدیت یا حذف ری‌اکشن برای یک نظر خاص
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_reaction(request, review_id):
    """
    ✅ ایجاد، حذف یا تغییر ری‌اکشن کاربر روی یک نظر
    اگر ری‌اکشن مشابه قبلاً وجود داشته باشد → حذف می‌شود.
    اگر ری‌اکشن دیگر باشد → آپدیت می‌شود.
    """
    from .models import ReviewReaction, ToolReview
    from .serializers import ReviewReactionSerializer

    review = ToolReview.objects.filter(id=review_id).first()
    if not review:
        return Response({"error": "نظر یافت نشد"}, status=404)

    reaction_type = request.data.get("type")
    if reaction_type not in ["like", "dislike"]:
        return Response({"error": "نوع ری‌اکشن معتبر نیست"}, status=400)

    user = request.user
    existing = ReviewReaction.objects.filter(user=user, review=review).first()

    if existing:
        if existing.type == reaction_type:
            existing.delete()
            return Response({"message": "ری‌اکشن حذف شد"}, status=200)
        else:
            existing.type = reaction_type
            existing.save()
            return Response({"message": "ری‌اکشن آپدیت شد"}, status=200)

    # ایجاد جدید
    ReviewReaction.objects.create(user=user, review=review, type=reaction_type)
    return Response({"message": "ری‌اکشن ثبت شد"}, status=201)


    # 🎯 API مقایسه چند ابزار
class ToolCompareView(APIView):
    def get(self, request):
        ids = request.query_params.get('ids')
        if not ids:
            return Response({"error": "ids parameter is required. e.g. ?ids=1,2"}, status=400)

        id_list = [int(pk) for pk in ids.split(',') if pk.isdigit()]
        tools = Tool.objects.filter(id__in=id_list)

        serializer = ToolSerializer(tools, many=True)

        # 🔍 لیست ویژگی‌های مقایسه‌ای که فرانت می‌تونه نشون بده
        comparison_fields = [
            "name", "license_type", "supports_farsi", "has_chatbot",
            "multi_language_support", "desktop_version",
            "highlight_feature", "is_sanctioned", "is_filtered",
        ]

        return Response({
            "tools": serializer.data,
            "fields": comparison_fields
        })
    
# ✅ فقط مدیرها می‌تونن ابزارها رو ببینن/مدیریت کنن (مثلاً داشبورد ادمین)
class AdminDashboardAPIView(generics.ListAPIView):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole]  # فقط مدیر

    def get_queryset(self):
        return Tool.objects.order_by('-created_at')  # جدیدترین ابزارها

# ✅ ویرایش یا حذف ابزار فقط توسط ادمین‌ها
class ToolAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole]  # فقط مدیرها

    # --------------------------------------------------
# 🎯 دریافت لیست نظرات فقط برای کاربر لاگین‌شده (پروفایل)
# --------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_reviews(request):
    """
    ✅ این ویو فقط نظرات مربوط به کاربر لاگین‌شده را نمایش می‌دهد.
    برای استفاده در صفحه پروفایل کاربرد دارد.
    """

    # 🔍 فقط نظراتی که توسط کاربر فعلی ثبت شده
    reviews = ToolReview.objects.filter(user=request.user).select_related("tool")

    # ✨ اگر بخوایم نام ابزار را هم داخل پاسخ بفرستیم، می‌تونیم serializer را تنظیم کنیم
    serializer = ToolReviewSerializer(reviews, many=True, context={"request": request})

    return Response(serializer.data)
# ✅ فقط ری‌اکشن‌های کاربر فعلی برای نظرات
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_reactions(request):
    user = request.user
    reactions = ReviewReaction.objects.filter(user=user)
    data = {r.review.id: r.type for r in reactions}
    return Response(data)

class ToolDeleteView(generics.DestroyAPIView):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer
    permission_classes = [IsAuthenticated, permissions.IsAdminUser]  # فقط مدیر