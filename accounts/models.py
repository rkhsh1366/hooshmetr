from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from datetime import timedelta
import random

# ✅ مدیر کاربر (User Manager) برای ساخت یوزر و سوپریوزر
class CustomUserManager(BaseUserManager):
    def create_user(self, mobile, password=None):
        if not mobile:
            raise ValueError("شماره موبایل اجباری است")
        user = self.model(mobile=mobile)
        user.set_password(password)  # هش کردن رمز (الان اختیاریه)
        user.save(using=self._db)
        return user

    def create_superuser(self, mobile, password):
        user = self.create_user(mobile, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user


# ✅ نقش کاربر: معمولی یا مدیر
ROLE_CHOICES = [
    ('user', 'کاربر عادی'),
    ('admin', 'مدیر سایت'),
]

# ✅ مدل اصلی کاربر
class CustomUser(AbstractBaseUser, PermissionsMixin):
    mobile = models.CharField(max_length=11, unique=True)  # شماره موبایل کلید اصلی ورود
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    objects = CustomUserManager()

    USERNAME_FIELD = 'mobile'  # ورود با موبایل
    REQUIRED_FIELDS = []  # چون فقط موبایل نیازه

    def __str__(self):
        return self.mobile



# ✅ مدل برای نگهداری کدهای تأیید ارسال‌شده به شماره موبایل
class OTP(models.Model):
    phone = models.CharField(max_length=11)
    code = models.CharField(max_length=5)
    created_at = models.DateTimeField(auto_now_add=True)
    attempts = models.PositiveSmallIntegerField(default=0)  # 🔁 تعداد دفعات تلاش

    def __str__(self):
        return f"{self.phone} - {self.code}"
    
    def is_expired(self):
        # ⏳ بررسی اینکه آیا کد بیش از ۲ دقیقه از عمرش گذشته
        return timezone.now() > self.created_at + timedelta(minutes=2)

    def can_try(self):
        # 🔁 بررسی اینکه آیا کمتر از ۵ بار تلاش کرده
        return self.attempts < 5