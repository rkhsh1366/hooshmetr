from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SendCodeSerializer, VerifyCodeSerializer
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError

class SendCodeView(APIView):
    def post(self, request):
        serializer = SendCodeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "کد تأیید ارسال شد ✅"}, status=200)
        return Response(serializer.errors, status=400)



class VerifyCodeView(APIView):
    def post(self, request):
        serializer = VerifyCodeSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=200)
        return Response(serializer.errors, status=400)


