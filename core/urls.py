"""
URL configuration for core project.

این فایل مسیرهای اصلی پروژه رو نگه می‌داره
هر اپلیکیشنی مثل tools، blog، auth و... آدرس‌های خودش رو از اینجا وارد می‌کنه
"""

from django.contrib import admin
from django.urls import path, include  # include برای مسیرهای داخلی اپ‌ها
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),                     # مسیر پنل مدیریت جنگو
    path('api/', include('tools.urls')),                 # ابزارهای هوش مصنوعی
    path('api/', include('accounts.urls')),              # احراز هویت و ارسال کد
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("tools.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
