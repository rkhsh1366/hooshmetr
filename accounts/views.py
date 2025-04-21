from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SendCodeSerializer, VerifyCodeSerializer

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