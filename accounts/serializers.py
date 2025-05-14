from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from .utils import send_otp_sms
from .models import OTP, CustomUser
import random

class SendCodeSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=11)

    def validate_mobile(self, value):
        if not value.isdigit() or len(value) != 11 or not value.startswith("09"):
            raise serializers.ValidationError("شماره موبایل معتبر نیست.")
        return value

    def create(self, validated_data):
        mobile = validated_data['mobile']
        code = str(random.randint(1000, 9999))

        OTP.objects.filter(mobile=mobile).delete()
        OTP.objects.create(mobile=mobile, code=code)
        send_otp_sms(mobile, code)

        return {'mobile': mobile}

class VerifyCodeSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=11)
    code = serializers.CharField(max_length=4)

    def validate(self, data):
        mobile = data['mobile']
        code = data['code']

        try:
            otp = OTP.objects.filter(mobile=mobile).latest('created_at')
        except OTP.DoesNotExist:
            raise serializers.ValidationError("کدی برای این شماره ثبت نشده است.")

        if not otp.can_try():
            raise serializers.ValidationError("تعداد تلاش‌ها به پایان رسیده است.")

        if otp.is_expired():
            raise serializers.ValidationError("کد منقضی شده است.")

        if otp.code != code:
            otp.attempts += 1
            otp.save()
            raise serializers.ValidationError("کد وارد شده اشتباه است.")

        user, _ = CustomUser.objects.get_or_create(mobile=mobile)

        refresh = RefreshToken.for_user(user)
        refresh["role"] = user.role
        refresh["mobile"] = user.mobile

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
        }
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email']
