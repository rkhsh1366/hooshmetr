from django.contrib.sitemaps import Sitemap
from django.urls import reverse

class StaticViewSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return ['home']  # هر اسم URL name که در urls.py تعریف کردی

    def location(self, item):
        return reverse(item)
