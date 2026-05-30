"""
Add activity_logs table
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('action', sa.String, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False),
    )

def downgrade():
    op.drop_table('activity_logs')
