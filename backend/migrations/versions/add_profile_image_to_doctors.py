"""
Add profile_image column to doctors table
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('doctors', sa.Column('profile_image', sa.String(255), nullable=True))

def downgrade():
    op.drop_column('doctors', 'profile_image')
