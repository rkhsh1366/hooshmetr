from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .forms import CustomAuthenticationForm

User = get_user_model()

# سفارشی‌سازی فرم لاگین پنل ادمین
admin.site.login_form = CustomAuthenticationForm
admin.site.login_template = 'admin/login.html'  # قالب پیش‌فرض خودش باقی می‌مونه
