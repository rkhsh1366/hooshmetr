from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from datetime import timedelta

# ✅ مدیر یوزر سفارشی
class CustomUserManager(BaseUserManager):
    def create_user(self, mobile, password=None):
        if not mobile:
            raise ValueError("شماره موبایل الزامی است.")
        user = self.model(mobile=mobile)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, mobile, password):
        user = self.create_user(mobile, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user

# ✅ نقش‌های کاربر
ROLE_CHOICES = [
    ('user', 'کاربر عادی'),
    ('admin', 'مدیر سایت'),
]

# ✅ مدل اصلی کاربر
class CustomUser(AbstractBaseUser, PermissionsMixin):
    mobile = models.CharField(max_length=11, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    objects = CustomUserManager()

    USERNAME_FIELD = 'mobile'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.mobile

# ✅ مدل کد تأیید
class OTP(models.Model):
    phone = models.CharField(max_length=11)
    code = models.CharField(max_length=5)
    created_at = models.DateTimeField(auto_now_add=True)
    attempts = models.PositiveSmallIntegerField(default=0)

    def __str__(self):
        return f"{self.phone} - {self.code}"

    def is_expired(self):
        """کد بیشتر از ۲ دقیقه اعتبار ندارد"""
        return timezone.now() > self.created_at + timedelta(minutes=2)

    def can_try(self):
        """حداکثر ۵ تلاش برای وارد کردن کد"""
        return self.attempts < 5
