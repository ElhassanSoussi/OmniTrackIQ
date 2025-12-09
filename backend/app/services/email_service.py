"""
Email service for sending notifications.
Supports SMTP and can be extended to use providers like SendGrid, Resend, etc.
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
from dataclasses import dataclass

from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class EmailMessage:
    """Email message structure."""
    to: str
    subject: str
    body_html: str
    body_text: Optional[str] = None
    reply_to: Optional[str] = None


def is_email_configured() -> bool:
    """Check if email sending is configured."""
    return bool(
        getattr(settings, 'SMTP_HOST', None) and
        getattr(settings, 'SMTP_PORT', None) and
        getattr(settings, 'SMTP_FROM_EMAIL', None)
    )


def send_email(message: EmailMessage) -> bool:
    """
    Send an email using SMTP.
    Returns True if successful, False otherwise.
    """
    if not is_email_configured():
        logger.warning("Email not configured, skipping send")
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = message.subject
        msg['From'] = settings.SMTP_FROM_EMAIL
        msg['To'] = message.to
        
        if message.reply_to:
            msg['Reply-To'] = message.reply_to

        # Attach both plain text and HTML versions
        if message.body_text:
            msg.attach(MIMEText(message.body_text, 'plain'))
        msg.attach(MIMEText(message.body_html, 'html'))

        # Connect to SMTP server
        smtp_host = getattr(settings, 'SMTP_HOST', 'localhost')
        smtp_port = getattr(settings, 'SMTP_PORT', 587)
        smtp_user = getattr(settings, 'SMTP_USER', None)
        smtp_password = getattr(settings, 'SMTP_PASSWORD', None)
        smtp_use_tls = getattr(settings, 'SMTP_USE_TLS', True)

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            if smtp_use_tls:
                server.starttls()
            if smtp_user and smtp_password:
                server.login(smtp_user, smtp_password)
            server.send_message(msg)

        logger.info(f"Email sent successfully to {message.to}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {message.to}: {e}")
        return False


def send_bulk_emails(messages: List[EmailMessage]) -> dict:
    """
    Send multiple emails.
    Returns dict with 'sent' and 'failed' counts.
    """
    sent = 0
    failed = 0
    
    for message in messages:
        if send_email(message):
            sent += 1
        else:
            failed += 1
    
    return {"sent": sent, "failed": failed}


# Email Templates

def get_team_invite_email(
    inviter_name: str,
    account_name: str,
    invite_url: str,
    role: str
) -> EmailMessage:
    """Generate team invite email."""
    subject = f"You've been invited to join {account_name} on OmniTrackIQ"
    
    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .button {{ display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>You're invited to join {account_name}</h2>
            <p>{inviter_name} has invited you to join their team on OmniTrackIQ as a <strong>{role}</strong>.</p>
            <p>OmniTrackIQ helps you track and optimize your advertising spend across multiple platforms.</p>
            <p style="margin: 30px 0;">
                <a href="{invite_url}" class="button">Accept Invitation</a>
            </p>
            <p>This invitation will expire in 7 days.</p>
            <div class="footer">
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                <p>© OmniTrackIQ</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    body_text = f"""
    You're invited to join {account_name}
    
    {inviter_name} has invited you to join their team on OmniTrackIQ as a {role}.
    
    Accept your invitation: {invite_url}
    
    This invitation will expire in 7 days.
    """
    
    return EmailMessage(
        to="",  # Will be set by caller
        subject=subject,
        body_html=body_html,
        body_text=body_text
    )


def get_anomaly_alert_email(
    user_name: str,
    anomaly_type: str,
    metric_name: str,
    current_value: float,
    expected_value: float,
    change_percent: float,
    campaign_name: Optional[str] = None,
    dashboard_url: str = ""
) -> EmailMessage:
    """Generate anomaly alert email."""
    direction = "increased" if change_percent > 0 else "decreased"
    abs_change = abs(change_percent)
    
    subject = f"⚠️ Alert: {metric_name} {direction} by {abs_change:.1f}%"
    
    campaign_info = f" for campaign <strong>{campaign_name}</strong>" if campaign_name else ""
    
    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .alert-box {{ background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }}
            .metric {{ font-size: 24px; font-weight: bold; color: #1f2937; }}
            .change {{ color: {'#dc2626' if change_percent < 0 else '#059669'}; font-weight: 600; }}
            .button {{ display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Anomaly Detected</h2>
            <p>Hi {user_name},</p>
            <p>We detected an unusual change in your metrics{campaign_info}:</p>
            
            <div class="alert-box">
                <p><strong>{metric_name}</strong></p>
                <p class="metric">{current_value:,.2f}</p>
                <p>Expected: {expected_value:,.2f}</p>
                <p class="change">{direction.capitalize()} by {abs_change:.1f}%</p>
            </div>
            
            <p style="margin: 30px 0;">
                <a href="{dashboard_url}" class="button">View Dashboard</a>
            </p>
            
            <div class="footer">
                <p>You're receiving this because you have anomaly alerts enabled.</p>
                <p>Manage your notification preferences in Settings.</p>
                <p>© OmniTrackIQ</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    body_text = f"""
    Anomaly Detected
    
    Hi {user_name},
    
    We detected an unusual change in your metrics{' for campaign ' + campaign_name if campaign_name else ''}:
    
    {metric_name}: {current_value:,.2f}
    Expected: {expected_value:,.2f}
    Change: {direction} by {abs_change:.1f}%
    
    View your dashboard: {dashboard_url}
    """
    
    return EmailMessage(
        to="",  # Will be set by caller
        subject=subject,
        body_html=body_html,
        body_text=body_text
    )


def get_weekly_report_email(
    user_name: str,
    account_name: str,
    period: str,
    total_spend: float,
    total_revenue: float,
    total_roas: float,
    top_campaigns: List[dict],
    dashboard_url: str = ""
) -> EmailMessage:
    """Generate weekly report email."""
    subject = f"📊 Weekly Report: {account_name} - {period}"
    
    campaigns_html = ""
    for i, camp in enumerate(top_campaigns[:5], 1):
        campaigns_html += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">{i}. {camp.get('name', 'Unknown')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${camp.get('spend', 0):,.2f}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">{camp.get('roas', 0):.2f}x</td>
        </tr>
        """
    
    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .stats {{ display: flex; justify-content: space-between; margin: 20px 0; }}
            .stat-box {{ background-color: #f9fafb; border-radius: 8px; padding: 15px; text-align: center; flex: 1; margin: 0 5px; }}
            .stat-value {{ font-size: 24px; font-weight: bold; color: #059669; }}
            .stat-label {{ font-size: 12px; color: #6b7280; text-transform: uppercase; }}
            .button {{ display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th {{ text-align: left; padding: 8px; background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Weekly Performance Report</h2>
            <p>Hi {user_name},</p>
            <p>Here's your weekly summary for <strong>{account_name}</strong> ({period}):</p>
            
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-value">${total_spend:,.0f}</div>
                    <div class="stat-label">Total Spend</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${total_revenue:,.0f}</div>
                    <div class="stat-label">Total Revenue</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">{total_roas:.2f}x</div>
                    <div class="stat-label">ROAS</div>
                </div>
            </div>
            
            <h3>Top Performing Campaigns</h3>
            <table>
                <thead>
                    <tr>
                        <th>Campaign</th>
                        <th style="text-align: right;">Spend</th>
                        <th style="text-align: right;">ROAS</th>
                    </tr>
                </thead>
                <tbody>
                    {campaigns_html}
                </tbody>
            </table>
            
            <p style="margin: 30px 0;">
                <a href="{dashboard_url}" class="button">View Full Report</a>
            </p>
            
            <div class="footer">
                <p>You're receiving this because you have weekly reports enabled.</p>
                <p>Manage your notification preferences in Settings.</p>
                <p>© OmniTrackIQ</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    body_text = f"""
    Weekly Performance Report
    
    Hi {user_name},
    
    Here's your weekly summary for {account_name} ({period}):
    
    Total Spend: ${total_spend:,.2f}
    Total Revenue: ${total_revenue:,.2f}
    ROAS: {total_roas:.2f}x
    
    View your full report: {dashboard_url}
    """
    
    return EmailMessage(
        to="",
        subject=subject,
        body_html=body_html,
        body_text=body_text
    )
