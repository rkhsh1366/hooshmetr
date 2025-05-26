# app/routers/image_upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.utils.file_upload import save_tool_image, save_blog_image
from app.dependencies.auth import get_admin_user
from app.models.user import User

router = APIRouter(
    prefix="/api/uploads",
    tags=["Uploads"],
)

@router.post("/tools", status_code=201)
def upload_tool_image(
    file: UploadFile = File(...),
    current_admin: User = Depends(get_admin_user)  # فقط ادمین می‌تواند تصویر ابزار آپلود کند
):
    """آپلود تصویر برای ابزار"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="فایل آپلود شده باید تصویر باشد")

    try:
        image_path = save_tool_image(file)
        return {"image_url": f"/{image_path}"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در آپلود تصویر: {str(e)}")

@router.post("/blog", status_code=201)
def upload_blog_image(
    file: UploadFile = File(...),
    current_admin: User = Depends(get_admin_user)  # فقط ادمین می‌تواند تصویر وبلاگ آپلود کند
):
    """آپلود تصویر برای وبلاگ"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="فایل آپلود شده باید تصویر باشد")

    try:
        image_path = save_blog_image(file)
        return {"image_url": f"/{image_path}"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در آپلود تصویر: {str(e)}")