from django.http import HttpResponse

def robots_txt(request):
    lines = [
        "User-Agent: *",
        "Disallow: /admin/",  # جلوی ایندکس صفحه مدیریت رو می‌گیره
        "Sitemap: https://hooshmetr.com/sitemap.xml"
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")