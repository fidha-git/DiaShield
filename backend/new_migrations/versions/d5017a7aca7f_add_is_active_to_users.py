"""add is_active to users

Revision ID: d5017a7aca7f
Revises: cf56b34b899f
Create Date: 2026-05-25 15:30:24.155601

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'd5017a7aca7f'
down_revision: Union[str, Sequence[str], None] = 'cf56b34b899f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "users",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=True,
            server_default="true"
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        "users",
        "is_active"
    )
