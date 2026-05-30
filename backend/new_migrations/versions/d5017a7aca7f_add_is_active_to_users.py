"""add is_active to users

Revision ID: d5017a7aca7f
Revises: cf56b34b899f
Create Date: 2026-05-25 15:30:24.155601

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

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
    sa.Column('medicines', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('advice', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], name=op.f('doctor_notes_appointment_id_fkey')),
    sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], name=op.f('doctor_notes_doctor_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('doctor_notes_pkey'))
    )
    op.create_index(op.f('ix_doctor_notes_id'), 'doctor_notes', ['id'], unique=False)
    op.create_table('medical_histories',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('patient_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('past_illnesses', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('surgeries', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('family_history', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('chronic_diseases', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('smoking_status', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('alcohol_status', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('notes', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], name=op.f('medical_histories_patient_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('medical_histories_pkey'))
    )
    op.create_index(op.f('ix_medical_histories_id'), 'medical_histories', ['id'], unique=False)
    op.create_table('medical_history',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('patient_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('past_illnesses', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('surgeries', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('family_history', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('chronic_diseases', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('smoking_status', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('alcohol_status', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('notes', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], name=op.f('medical_history_patient_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('medical_history_pkey'))
    )
    op.create_index(op.f('ix_medical_history_id'), 'medical_history', ['id'], unique=False)
    op.create_table('health_records',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('patient_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('blood_sugar', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('blood_pressure', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('heart_rate', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('bmi', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('weight', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('notes', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('recorded_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], name=op.f('health_records_patient_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('health_records_pkey'))
    )
    op.create_index(op.f('ix_health_records_id'), 'health_records', ['id'], unique=False)
    op.create_table('prescriptions',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('appointment_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('doctor_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('medicines', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('dosage', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('duration', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('instructions', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], name=op.f('prescriptions_appointment_id_fkey')),
    sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], name=op.f('prescriptions_doctor_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('prescriptions_pkey'))
    )
    op.create_index(op.f('ix_prescriptions_id'), 'prescriptions', ['id'], unique=False)
    # ### end Alembic commands ###
