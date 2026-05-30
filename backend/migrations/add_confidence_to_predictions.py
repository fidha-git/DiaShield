"""
Alembic migration for adding confidence column to predictions table.

Production best practices:
- Use batch_alter_table for SQLite compatibility
- Add NOT NULL with server_default for existing rows
- Add beginner-friendly comments
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_confidence_to_predictions'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add a new column 'confidence' to the predictions table
    # This stores the model's confidence score for each prediction (float, not null, default 0.0)
    with op.batch_alter_table('predictions') as batch_op:
        batch_op.add_column(
            sa.Column('confidence', sa.Float(), nullable=False, server_default='0.0', comment='Model confidence score (0.0 - 1.0)')
        )


def downgrade():
    # Remove the 'confidence' column if downgrading
    with op.batch_alter_table('predictions') as batch_op:
        batch_op.drop_column('confidence')
