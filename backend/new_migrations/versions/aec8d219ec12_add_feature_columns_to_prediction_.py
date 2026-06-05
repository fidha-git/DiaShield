"""add_feature_columns_to_prediction_histories

Revision ID: aec8d219ec12
Revises: b5c4d3e2f1a0
Create Date: 2026-06-03 11:52:25.804274

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aec8d219ec12'
down_revision: Union[str, Sequence[str], None] = 'b5c4d3e2f1a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('prediction_histories', sa.Column('glucose', sa.Float(), nullable=True))
    op.add_column('prediction_histories', sa.Column('bmi', sa.Float(), nullable=True))
    op.add_column('prediction_histories', sa.Column('blood_pressure', sa.Float(), nullable=True))
    op.add_column('prediction_histories', sa.Column('age', sa.Integer(), nullable=True))
    op.add_column('prediction_histories', sa.Column('pregnancies', sa.Integer(), nullable=True))
    op.add_column('prediction_histories', sa.Column('skin_thickness', sa.Float(), nullable=True))
    op.add_column('prediction_histories', sa.Column('insulin', sa.Float(), nullable=True))
    op.add_column('prediction_histories', sa.Column('diabetes_pedigree', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('prediction_histories', 'diabetes_pedigree')
    op.drop_column('prediction_histories', 'insulin')
    op.drop_column('prediction_histories', 'skin_thickness')
    op.drop_column('prediction_histories', 'pregnancies')
    op.drop_column('prediction_histories', 'age')
    op.drop_column('prediction_histories', 'blood_pressure')
    op.drop_column('prediction_histories', 'bmi')
    op.drop_column('prediction_histories', 'glucose')
