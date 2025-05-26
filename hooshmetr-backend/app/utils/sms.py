# app/utils/sms.py
import requests
from urllib.parse import quote
import os
import logging

def send_verification_code(mobile: str, code: str) -> bool:
    """ارسال کد تأیید به شماره موبایل کاربر"""
    username = os.getenv("TSMS_USERNAME")
    password = os.getenv("TSMS_PASSWORD")
    sender = os.getenv("TSMS_SENDER_PRIMARY")
    message = f"کد ورود شما: {code}\nهوش‌متر"
    encoded = quote(message)

    # بررسی تنظیمات سرویس پیامک
    if not all([username, password, sender]):
        logging.error("تنظیمات سرویس پیامک کامل نیست")
        return False

    url = (
        f"https://tsms.ir/url/tsmshttp.php?from={sender}&to={mobile}"
        f"&username={username}&password={password}&message={encoded}"
    )

    try:
        # در محیط توسعه، پیامک واقعی ارسال نکنید
        if os.getenv("DEBUG", "True") == "True":
            logging.info(f"ارسال پیامک به {mobile}: کد تأیید شما: {code}")
            return True
            
        response = requests.get(url, timeout=10)
        return response.text.strip() == "1"
    except requests.RequestException as e:
        logging.error(f"خطا در ارسال پیامک: {str(e)}")
        return False