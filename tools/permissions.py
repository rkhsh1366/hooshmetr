# tools/permissions.py
from rest_framework import permissions
from rest_framework.permissions import BasePermission


# 🎯 فقط صاحب نظر اجازه ویرایش یا حذف نظر خودش رو داره
class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    فقط صاحب یا مدیر اجازه تغییر داره
    """

    def has_object_permission(self, request, view, obj):
        # اجازه GET، HEAD یا OPTIONS همیشه هست
        if request.method in permissions.SAFE_METHODS:
            return True
        # فقط اگر صاحب یا مدیر باشه
        return obj.user == request.user or request.user.is_staff
    
class IsAdminUserRole(BasePermission):
    """
    فقط کاربران با نقش 'admin' اجازه دسترسی دارند.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'
