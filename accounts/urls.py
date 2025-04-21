from django.urls import path
from .views import SendCodeView, VerifyCodeView

urlpatterns = [
    path('auth/send-code/', SendCodeView.as_view(), name='send-code'),
    path('auth/verify-code/', VerifyCodeView.as_view(), name='verify-code'),
]
