from django.contrib import admin
from .models import Tool, Category, Technology

# ✅ نحوه نمایش مدل Tool در پنل ادمین
@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    # ستون‌هایی که توی لیست ابزارها نمایش داده می‌شن
    list_display = ('name', 'license_type', 'supports_farsi', 'is_sanctioned', 'is_filtered')

    # قابلیت سرچ توی این فیلدها
    search_fields = ('name', 'description')

    # فیلترهای کناری برای راحت‌تر پیدا کردن ابزارها
    list_filter = ('license_type', 'supports_farsi', 'is_sanctioned', 'is_filtered', 'categories', 'technologies')

    # برای راحت‌تر انتخاب کردن فیلدهای many-to-many
    filter_horizontal = ('categories', 'technologies')

# ✅ ثبت دسته‌بندی‌ها در پنل ادمین
admin.site.register(Category)

# ✅ ثبت تکنولوژی‌ها در پنل ادمین
admin.site.register(Technology)
