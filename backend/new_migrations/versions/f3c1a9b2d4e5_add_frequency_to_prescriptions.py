"""add_frequency_to_prescriptions

Revision ID: f3c1a9b2d4e5
Revises: d5017a7aca7f
Create Date: 2026-06-01 19:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3c1a9b2d4e5'
down_revision: Union[str, Sequence[str], None] = 'd5017a7aca7f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('prescriptions', sa.Column('frequency', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('prescriptions', 'frequency')
