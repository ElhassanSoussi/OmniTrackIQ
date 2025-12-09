"""Add notification preferences and logs tables

Revision ID: 0008_notification_preferences
Revises: 0007_enhance_subscriptions
Create Date: 2024-12-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0008_notification_preferences'
down_revision = '0007_enhance_subscriptions'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create notification_preferences table
    op.create_table(
        'notification_preferences',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        
        # Global preferences
        sa.Column('email_notifications_enabled', sa.Boolean(), default=True, nullable=False),
        sa.Column('in_app_notifications_enabled', sa.Boolean(), default=True, nullable=False),
        
        # Anomaly alert preferences
        sa.Column('anomaly_alerts_enabled', sa.Boolean(), default=True, nullable=False),
        sa.Column('anomaly_sensitivity', sa.String(20), default='medium', nullable=False),
        
        # Spend alert preferences
        sa.Column('spend_alerts_enabled', sa.Boolean(), default=False, nullable=False),
        sa.Column('daily_spend_threshold', sa.Integer(), nullable=True),
        
        # ROAS alert preferences
        sa.Column('roas_alerts_enabled', sa.Boolean(), default=False, nullable=False),
        sa.Column('roas_threshold', sa.Integer(), nullable=True),
        
        # Budget alert preferences
        sa.Column('budget_alerts_enabled', sa.Boolean(), default=True, nullable=False),
        sa.Column('budget_alert_percentage', sa.Integer(), default=80, nullable=False),
        
        # Report preferences
        sa.Column('weekly_report_enabled', sa.Boolean(), default=True, nullable=False),
        sa.Column('weekly_report_day', sa.Integer(), default=1, nullable=False),
        sa.Column('monthly_report_enabled', sa.Boolean(), default=False, nullable=False),
        
        # Quiet hours
        sa.Column('quiet_hours_enabled', sa.Boolean(), default=False, nullable=False),
        sa.Column('quiet_hours_start', sa.Integer(), default=22, nullable=False),
        sa.Column('quiet_hours_end', sa.Integer(), default=8, nullable=False),
        sa.Column('timezone', sa.String(50), default='UTC', nullable=False),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    
    # Create index on user_id for notification_preferences
    op.create_index('ix_notification_preferences_user_id', 'notification_preferences', ['user_id'], unique=True)
    
    # Create notification_logs table
    op.create_table(
        'notification_logs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        
        sa.Column('alert_type', sa.String(50), nullable=False),
        sa.Column('channel', sa.String(20), nullable=False),
        
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.String(2000), nullable=True),
        
        sa.Column('reference_id', sa.String(100), nullable=True),
        
        sa.Column('sent_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('read_at', sa.DateTime(), nullable=True),
    )
    
    # Create indexes for notification_logs
    op.create_index('ix_notification_logs_user_id', 'notification_logs', ['user_id'])
    op.create_index('ix_notification_logs_sent_at', 'notification_logs', ['sent_at'])
    op.create_index('ix_notification_logs_read_at', 'notification_logs', ['read_at'])


def downgrade() -> None:
    op.drop_index('ix_notification_logs_read_at', table_name='notification_logs')
    op.drop_index('ix_notification_logs_sent_at', table_name='notification_logs')
    op.drop_index('ix_notification_logs_user_id', table_name='notification_logs')
    op.drop_table('notification_logs')
    
    op.drop_index('ix_notification_preferences_user_id', table_name='notification_preferences')
    op.drop_table('notification_preferences')
