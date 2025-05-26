# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# اضافه کردن مسیر پروژه به sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# وارد کردن تنظیمات و مدل‌ها
from app.database import Base
from app.config import settings

# وارد کردن تمام مدل‌ها برای شناسایی توسط Alembic
from app.models import *

# این تابع پیکربندی را از فایل alembic.ini می‌خواند
config = context.config

# تنظیم URL دیتابیس - استفاده از raw string برای جلوگیری از خطای %
database_url = settings.DATABASE_URL.replace('%', '%%')
config.set_main_option("sqlalchemy.url", database_url)

# تنظیم logger
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# تنظیم target_metadata برای Alembic
target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()