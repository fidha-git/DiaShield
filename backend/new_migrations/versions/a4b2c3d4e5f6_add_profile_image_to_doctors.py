"""add_profile_image_to_doctors

Revision ID: a4b2c3d4e5f6
Revises: f3c1a9b2d4e5
Create Date: 2026-06-02 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a4b2c3d4e5f6'
down_revision: Union[str, None] = 'f3c1a9b2d4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('doctors', sa.Column('profile_image', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('doctors', 'profile_image')
