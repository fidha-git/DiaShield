"""
Revision ID: add_is_active_to_users
Revises: 
Create Date: 2026-05-25

Add is_active column to users table, default TRUE for existing users.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_is_active_to_users'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()))


def downgrade():
    op.drop_column('users', 'is_active')
