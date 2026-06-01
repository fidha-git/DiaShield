"""
Add commercial healthcare fields to patients table
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_commercial_fields_to_patients'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('patients', sa.Column('email', sa.String(length=255), nullable=False, server_default=''))
    op.add_column('patients', sa.Column('emergency_contact_name', sa.String(length=255), nullable=True))
    op.add_column('patients', sa.Column('emergency_contact_phone', sa.String(length=100), nullable=True))
    op.add_column('patients', sa.Column('emergency_contact_relationship', sa.String(length=100), nullable=True))
    op.add_column('patients', sa.Column('insurance_provider', sa.String(length=255), nullable=True))
    op.add_column('patients', sa.Column('policy_number', sa.String(length=255), nullable=True))
    op.add_column('patients', sa.Column('group_code', sa.String(length=255), nullable=True))
    op.add_column('patients', sa.Column('primary_clinic', sa.String(length=255), nullable=True))
    op.add_column('patients', sa.Column('updated_at', sa.TIMESTAMP(), nullable=True))

def downgrade():
    op.drop_column('patients', 'updated_at')
    op.drop_column('patients', 'primary_clinic')
    op.drop_column('patients', 'group_code')
    op.drop_column('patients', 'policy_number')
    op.drop_column('patients', 'insurance_provider')
    op.drop_column('patients', 'emergency_contact_relationship')
    op.drop_column('patients', 'emergency_contact_phone')
    op.drop_column('patients', 'emergency_contact_name')
    op.drop_column('patients', 'email')
