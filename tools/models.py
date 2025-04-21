
from django.db import models
from django.contrib.auth import get_user_model  # ✅ گرفتن مدل کاربر سفارشی

User = get_user_model()  # ✅ استفاده از مدل کاربر تعریف‌شده در settings.py

# مدل دسته‌بندی برای ابزارها (مثل: تولید متن، ساخت تصویر، تحلیل داده و...)
class Category(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name  # برای نمایش بهتر در پنل ادمین

# مدل تکنولوژی‌هایی که ابزار ازشون استفاده می‌کنه (مثلاً: GPT-4، Stable Diffusion)
class Technology(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

# ✅ مدل تگ‌ها (برچسب‌هایی برای ابزارها)
class Tag(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def save(self, *args, **kwargs):
        # 🔥 نرمال‌سازی قبل از ذخیره در DB
        self.name = self.name.strip().lower()  # حذف فاصله و lowercase
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.name
    

# مدل اصلی ابزارهای هوش مصنوعی
class Tool(models.Model):
    # انتخاب بین رایگان، پولی، یا فریمیوم
    LICENSE_CHOICES = [
        ('free', 'رایگان'),
        ('paid', 'پولی'),
        ('freemium', 'فریمیوم'),
    ]

    name = models.CharField(max_length=100, unique=True)  # اسم ابزار، منحصر به‌فرد
    description = models.TextField()                      # توضیحات کلی درباره ابزار
    website = models.URLField()                           # آدرس سایت ابزار
    license_type = models.CharField(max_length=10, choices=LICENSE_CHOICES)  # نوع لایسنس
    supports_farsi = models.BooleanField(default=False)   # آیا از زبان فارسی پشتیبانی می‌کنه؟
    is_sanctioned = models.BooleanField(default=False)    # آیا ایران رو تحریم کرده؟
    is_filtered = models.BooleanField(default=False)      # آیا در ایران فیلتره؟
    highlight_feature = models.TextField(blank=True, null=True)  # ویژگی خاص و متمایز ابزار
    categories = models.ManyToManyField(Category)         # دسته‌بندی‌ها (چندتایی)
    technologies = models.ManyToManyField(Technology)     # تکنولوژی‌های استفاده‌شده
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)  # آپلود لوگو
    homepage_screenshot = models.ImageField(upload_to='screenshots/', blank=True, null=True)  # اسکرین‌شات
    created_at = models.DateTimeField(auto_now_add=True)  # زمان ثبت خودکار
    has_chatbot = models.BooleanField(default=False)      # پشتیبانی از چت بات
    multi_language_support = models.BooleanField(default=False) # چند زبانه بودن
    desktop_version = models.BooleanField(default=False)    # پشتیبانی از نسخه ویندوز
    tags = models.ManyToManyField(Tag, blank=True)  # برچسب‌های ابزار (چندتایی و اختیاری)


    def __str__(self):
        return self.name
    

# مدل نظردهی و امتیازدهی کاربران
class ToolReview(models.Model):
    tool = models.ForeignKey('Tool', on_delete=models.CASCADE, related_name='reviews')  # ابزار مربوطه
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # کاربری که نظر داده
    rating = models.PositiveSmallIntegerField()  # امتیاز از 1 تا 5
    comment = models.TextField(blank=True)  # متن نظر (اختیاری)
    created_at = models.DateTimeField(auto_now_add=True)  # تاریخ ثبت نظر
    parent = models.ForeignKey(  # 🔄 ریپلای به نظر دیگر
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies',
        verbose_name='پاسخ به نظر'
    )
    updated_at = models.DateTimeField(auto_now=True)  # 🕒 زمان آخرین ویرایش

    class Meta:
        unique_together = ['tool', 'user']  # ✅ فقط یک نظر برای هر ابزار از هر کاربر

    def __str__(self):
        return f'{self.user} - {self.tool.name} - {self.rating}⭐️'
    
  
# models.py (اپ tools)

class ReviewReaction(models.Model):
    review = models.ForeignKey(ToolReview, related_name="reactions", on_delete=models.CASCADE)
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE)  # یا get_user_model() بسته به پروژه شما
    type = models.CharField(
        max_length=10,
        choices=[("like", "لایک"), ("dislike", "دیس‌لایک")],
        default="like"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['review', 'user']  # ✅ هر کاربر فقط یک ری‌اکشن برای هر نظر

    def __str__(self):
        return f"{self.user} - {self.review} - {self.type}"
