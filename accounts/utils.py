# accounts/utils.py
import requests
from urllib.parse import quote
from django.conf import settings

def send_otp_sms(phone, code):
    username = settings.TSMS_USERNAME
    password = settings.TSMS_PASSWORD
    senders = [settings.TSMS_SENDER_PRIMARY, settings.TSMS_SENDER_FALLBACK]

    message = f"کد ورود شما: {code}"
    encoded_message = quote(message)

    for sender in senders:
        url = (
            f"http://tsms.ir/url/tsmshttp.php?"
            f"from={sender}&to={phone}&username={username}&password={password}"
            f"&message={encoded_message}"
        )
        try:
            response = requests.get(url, timeout=10)
            print(f"📨 پاسخ TSMS از {sender}:", response.text)
            if response.text.strip() == "1":
                return True  # ارسال موفق
        except requests.RequestException as e:
            print(f"❌ خطا در خط {sender}:", str(e))

    return False  # ارسال از هیچ‌کدام موفق نبود

