import requests
from urllib.parse import quote
from django.conf import settings

def send_otp_sms(mobile, code):
    username = settings.TSMS_USERNAME
    password = settings.TSMS_PASSWORD
    sender = settings.TSMS_SENDER_PRIMARY
    message = f"کد ورود شما: {code}\nهوش‌متر"
    encoded_message = quote(message)

    url = (
        f"https://tsms.ir/url/tsmshttp.php?"
        f"from={sender}&to={mobile}&username={username}&password={password}"
        f"&message={encoded_message}"
    )

    try:
        response = requests.get(url, timeout=10)
        return response.text.strip() == "1"
    except requests.RequestException:
        return False
