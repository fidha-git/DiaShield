"""add_profile_image_to_users

Revision ID: b5c4d3e2f1a0
Revises: a4b2c3d4e5f6
Create Date: 2026-06-02 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b5c4d3e2f1a0'
down_revision: Union[str, None] = 'a4b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('profile_image', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'profile_image')
