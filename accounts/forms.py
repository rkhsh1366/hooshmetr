from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()

# فرم ورود سفارشی‌شده برای پنل ادمین
class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        label=_("Mobile"),
        widget=forms.TextInput(attrs={"autofocus": True}),
    )

    def confirm_login_allowed(self, user):
        if not user.is_active:
            raise forms.ValidationError(
                _("This account is inactive."),
                code="inactive",
            )
