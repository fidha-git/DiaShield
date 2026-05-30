"""add_user_security_fields"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.

revision = '2939607a6432'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade schema."""

    # Add role column with default value for existing users
    op.add_column(
        'users',
        sa.Column(
            'role',
            sa.String(length=20),
            nullable=False,
            server_default='user'
        )
    )

    # Add profile image
    op.add_column(
        'users',
        sa.Column(
            'profile_image',
            sa.String(),
            nullable=True
        )
    )

    # Add email verification field
    op.add_column(
        'users',
        sa.Column(
            'email_verified',
            sa.Boolean(),
            nullable=False,
            server_default='false'
        )
    )

    # Add refresh token
    op.add_column(
        'users',
        sa.Column(
            'refresh_token',
            sa.String(),
            nullable=True
        )
    )

    # Add blocked status
    op.add_column(
        'users',
        sa.Column(
            'is_blocked',
            sa.Boolean(),
            nullable=False,
            server_default='false'
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column('users', 'is_blocked')
    op.drop_column('users', 'refresh_token')
    op.drop_column('users', 'email_verified')
    op.drop_column('users', 'profile_image')
    op.drop_column('users', 'role')