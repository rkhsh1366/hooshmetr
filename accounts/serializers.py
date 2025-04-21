from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from .models import OTP, CustomUser
import random

class SendCodeSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 11:
            raise serializers.ValidationError("شماره موبایل معتبر نیست.")
        return value

    def create(self, validated_data):
        phone = validated_data['phone']
        code = str(random.randint(10000, 99999))  # ✅ کد ۵ رقمی تصادفی

        # ذخیره در دیتابیس
        OTP.objects.create(phone=phone, code=code)

        # فعلاً چاپ در ترمینال
        print(f"کد تأیید برای {phone}: {code}")

        return {'phone': phone}
    

    
class VerifyCodeSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)
    code = serializers.CharField(max_length=5)

    def validate(self, data):
        phone = data['phone']
        code = data['code']

        # پیدا کردن آخرین کد ثبت‌شده برای این شماره
        try:
            otp = OTP.objects.filter(phone=phone).latest('created_at')
        except OTP.DoesNotExist:
            raise serializers.ValidationError("کدی برای این شماره ثبت نشده است.")

        # ⛔ بررسی تعداد تلاش
        if not otp.can_try():
            raise serializers.ValidationError("تعداد تلاش‌های شما تمام شده است.")

        # ⛔ بررسی انقضا
        if otp.is_expired():
            raise serializers.ValidationError("کد منقضی شده است.")

        # ⛔ بررسی درستی کد
        if otp.code != code:
            otp.attempts += 1
            otp.save()
            raise serializers.ValidationError("کد وارد شده نادرست است.")

        # ✅ همه‌چی اوکیه → کاربر بساز یا پیداش کن
        user, created = CustomUser.objects.get_or_create(mobile=phone)

        # ✅ صدور توکن JWT
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }