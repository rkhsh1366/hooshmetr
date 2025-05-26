"""Remove OTP table

Revision ID: d5b952df0df8
Revises: da2696920a92
Create Date: 2025-05-18 20:26:53.345872

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5b952df0df8'
down_revision: Union[str, None] = 'da2696920a92'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # حذف جدول OTP
    op.drop_table('otps')


def downgrade():
    # بازگرداندن جدول OTP در صورت نیاز به بازگشت
    op.create_table('otps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('mobile', sa.String(length=11), nullable=True),
        sa.Column('code', sa.String(length=4), nullable=True),
        sa.Column('attempts', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_otps_id', 'otps', ['id'], unique=False)
    op.create_index('ix_otps_mobile', 'otps', ['mobile'], unique=False)
