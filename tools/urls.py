# tools/urls.py
# -----------------------------------------------
# 📌 مسیرهای API مربوط به ابزارها، نظرات، دسته‌بندی‌ها و مقایسه و ری‌اکشن
# -----------------------------------------------

from django.urls import path

# 🧠 ایمپورت ویوهای اصلی
from .views import (
    ToolListCreateView,
    ToolDetailView,
    CategoryListCreateView,
    TechnologyListCreateView,
    ToolReviewListCreateView,
    ToolReviewCreateView,
    ToolReviewDetailView,
    TopRatedToolsView,
    ToolCompareView,
    TagListCreateView,
    ReviewReactionView,
    toggle_reaction,
    my_reviews,
    ToolDeleteView,
    AdminDashboardAPIView,
    ToolAdminDetailView,
)

urlpatterns = [
    # 🔹 لیست ابزارها + افزودن ابزار جدید
    path('tools/', ToolListCreateView.as_view(), name='tool-list-create'),

    # 🔹 نمایش اطلاعات ابزار خاص
    path('tools/<int:pk>/', ToolDetailView.as_view(), name='tool-detail'),

    # 🔹 ثبت نظر جدید برای ابزار خاص (فقط POST)
    path('tools/<int:tool_id>/reviews/', ToolReviewCreateView.as_view(), name='tool-review-create'),

    # 🔹 لیست نظرات کلی (فقط برای ادمین‌ها مفیدتره)
    path('reviews/', ToolReviewListCreateView.as_view(), name='tool-review-list-create'),

    # 🔹 ویرایش، حذف و دریافت جزئیات یک نظر خاص
    path('reviews/<int:pk>/', ToolReviewDetailView.as_view(), name='review-detail'),

    # 🔹 مسیر ثبت ری‌اکشن اولیه (لایک یا دیسلایک)
    path('reactions/', ReviewReactionView.as_view(), name='reaction-create'),

    # 🔁 مسیر هوشمند برای ایجاد/حذف/آپدیت ری‌اکشن روی یک نظر خاص
    path('reviews/<int:review_id>/toggle-reaction/', toggle_reaction, name='toggle_reaction'),

    # 🔸 فقط لیست نظرات ثبت‌شده توسط کاربر فعلی
    path("reviews/my/", my_reviews, name="my-reviews"),

    # 🧩 مقایسه ابزارها با آیدی‌های دلخواه
    path('tools/compare/', ToolCompareView.as_view(), name='tool-compare'),

    # 🌟 لیست ابزارهایی با بالاترین امتیاز کاربران
    path('tools/top/', TopRatedToolsView.as_view(), name='top-rated-tools'),

    # 🏷️ لیست تگ‌ها + افزودن تگ جدید
    path('tags/', TagListCreateView.as_view(), name='tag-list-create'),

    # 🗂️ لیست دسته‌بندی‌ها
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),

    # 🔧 لیست تکنولوژی‌های موجود
    path('technologies/', TechnologyListCreateView.as_view(), name='technology-list-create'),

    #برای حذف ابزار توسط مدیر
    path("tools/<int:pk>/delete/", ToolDeleteView.as_view(), name="tool-delete"),


    path("admin/dashboard/", AdminDashboardAPIView.as_view(), name="admin-dashboard"),

    path("admin/tools/<int:pk>/", ToolAdminDetailView.as_view(), name="admin-tool-edit"),

]
