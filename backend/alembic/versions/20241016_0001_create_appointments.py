"""create appointments table

Revision ID: 20241016_0001
Revises:
Create Date: 2024-10-16 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20241016_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "appointments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patient_name", sa.String(length=120), nullable=False),
        sa.Column("doctor_name", sa.String(length=120), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("priority", sa.String(length=32), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_appointments_id"), "appointments", ["id"], unique=False)
    op.create_index(op.f("ix_appointments_status"), "appointments", ["status"], unique=False)
    op.create_index(op.f("ix_appointments_priority"), "appointments", ["priority"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_appointments_priority"), table_name="appointments")
    op.drop_index(op.f("ix_appointments_status"), table_name="appointments")
    op.drop_index(op.f("ix_appointments_id"), table_name="appointments")
    op.drop_table("appointments")
