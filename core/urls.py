from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from main.views import robots_txt
from django.contrib.sitemaps.views import sitemap
from main.sitemaps import StaticViewSitemap
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


sitemaps = {
    'static': StaticViewSitemap
}

urlpatterns = [
    path('admin/', admin.site.urls),                     # مسیر پنل مدیریت جنگو
    path('api/', include('tools.urls')),                 # ابزارهای هوش مصنوعی
    path('api/auth/', include('accounts.urls')),         # احراز هویت و ارسال کد (تغییر مسیر 'api/')
    path("robots.txt", robots_txt, name="robots_txt"),
    path("sitemap.xml", sitemap, {'sitemaps': sitemaps}, name="sitemap"),
    path('api/blog/', include('blog.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]

# اضافه کردن تنظیمات static برای فایل‌های media هنگام DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
