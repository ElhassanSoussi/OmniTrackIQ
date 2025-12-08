"""
Data sync tasks for pulling data from connected platforms.
These tasks run in the background via APScheduler.
"""
import logging
from datetime import datetime, timedelta
from typing import Optional, List
import httpx

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models.integration import Integration
from app.models.ad_spend import AdSpend
from app.models.order import Order
from app.models.daily_metrics import DailyMetrics
from app.config import settings

logger = logging.getLogger(__name__)


async def sync_all_integrations():
    """
    Master sync job that triggers sync for all connected integrations.
    Called periodically by the scheduler.
    """
    logger.info("Starting sync for all integrations")
    
    db = SessionLocal()
    try:
        # Get all active integrations
        integrations = db.query(Integration).filter(
            Integration.status == "connected",
            Integration.access_token.isnot(None),
        ).all()
        
        logger.info(f"Found {len(integrations)} active integrations to sync")
        
        for integration in integrations:
            try:
                await sync_integration(db, integration)
            except Exception as e:
                logger.error(f"Error syncing {integration.platform} for account {integration.account_id}: {e}")
                
    finally:
        db.close()
    
    logger.info("Completed sync for all integrations")


async def sync_integration(db: Session, integration: Integration):
    """Sync data for a single integration."""
    platform = integration.platform
    
    if platform == "facebook":
        await sync_facebook_ads(db, integration)
    elif platform == "google_ads":
        await sync_google_ads(db, integration)
    elif platform == "tiktok":
        await sync_tiktok_ads(db, integration)
    elif platform == "shopify":
        await sync_shopify_orders(db, integration)
    elif platform == "ga4":
        await sync_ga4_metrics(db, integration)
    else:
        logger.warning(f"Unknown platform: {platform}")


async def sync_facebook_ads(db: Session, integration: Integration):
    """
    Sync Facebook Ads data (campaigns, ad sets, spend).
    Uses the Facebook Marketing API.
    """
    logger.info(f"Syncing Facebook Ads for account {integration.account_id}")
    
    access_token = integration.access_token
    if not access_token:
        logger.warning("No access token for Facebook integration")
        return
    
    # Get ad accounts
    async with httpx.AsyncClient() as client:
        try:
            # Get user's ad accounts
            accounts_response = await client.get(
                "https://graph.facebook.com/v18.0/me/adaccounts",
                params={
                    "access_token": access_token,
                    "fields": "id,name,account_status",
                }
            )
            
            if accounts_response.status_code != 200:
                logger.error(f"Failed to fetch Facebook ad accounts: {accounts_response.text}")
                return
            
            ad_accounts = accounts_response.json().get("data", [])
            
            for ad_account in ad_accounts:
                await _sync_facebook_ad_account(db, client, integration, ad_account, access_token)
                
        except Exception as e:
            logger.error(f"Facebook sync error: {e}")
            raise


async def _sync_facebook_ad_account(
    db: Session,
    client: httpx.AsyncClient,
    integration: Integration,
    ad_account: dict,
    access_token: str,
):
    """Sync campaigns and spend for a single Facebook ad account."""
    account_id = ad_account["id"]
    
    # Date range: last 30 days
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=30)
    
    # Fetch insights (aggregated metrics)
    insights_response = await client.get(
        f"https://graph.facebook.com/v18.0/{account_id}/insights",
        params={
            "access_token": access_token,
            "fields": "campaign_id,campaign_name,spend,impressions,clicks,actions,date_start,date_stop",
            "level": "campaign",
            "time_range": f'{{"since":"{start_date}","until":"{end_date}"}}',
            "time_increment": 1,  # Daily breakdown
        }
    )
    
    if insights_response.status_code != 200:
        logger.error(f"Failed to fetch Facebook insights: {insights_response.text}")
        return
    
    insights = insights_response.json().get("data", [])
    
    for insight in insights:
        try:
            spend = float(insight.get("spend", 0))
            impressions = int(insight.get("impressions", 0))
            clicks = int(insight.get("clicks", 0))
            
            # Parse conversions from actions
            conversions = 0
            conversion_value = 0.0
            for action in insight.get("actions", []):
                if action.get("action_type") == "purchase":
                    conversions += int(action.get("value", 0))
                if action.get("action_type") == "omni_purchase":
                    conversion_value += float(action.get("value", 0))
            
            date = datetime.strptime(insight["date_start"], "%Y-%m-%d").date()
            
            # Upsert ad spend record
            ad_spend = db.query(AdSpend).filter(
                AdSpend.account_id == integration.account_id,
                AdSpend.platform == "facebook",
                AdSpend.campaign_id == insight.get("campaign_id"),
                AdSpend.date == date,
            ).first()
            
            if not ad_spend:
                ad_spend = AdSpend(
                    account_id=integration.account_id,
                    platform="facebook",
                    campaign_id=insight.get("campaign_id"),
                    campaign_name=insight.get("campaign_name"),
                    date=date,
                )
                db.add(ad_spend)
            
            ad_spend.spend = spend
            ad_spend.impressions = impressions
            ad_spend.clicks = clicks
            ad_spend.conversions = conversions
            ad_spend.conversion_value = conversion_value
            
            db.commit()
            
        except Exception as e:
            logger.error(f"Error processing Facebook insight: {e}")
            db.rollback()
    
    logger.info(f"Synced {len(insights)} Facebook insights for account {integration.account_id}")


async def sync_google_ads(db: Session, integration: Integration):
    """
    Sync Google Ads data.
    Uses the Google Ads API (requires developer token).
    """
    logger.info(f"Syncing Google Ads for account {integration.account_id}")
    
    access_token = integration.access_token
    if not access_token:
        logger.warning("No access token for Google Ads integration")
        return
    
    # Note: Google Ads API requires additional setup (developer token, customer ID)
    # This is a placeholder implementation
    logger.info("Google Ads sync - requires developer token setup")
    
    # Update integration timestamp
    integration.updated_at = datetime.utcnow()
    db.commit()


async def sync_tiktok_ads(db: Session, integration: Integration):
    """
    Sync TikTok Ads data.
    Uses the TikTok Marketing API.
    """
    logger.info(f"Syncing TikTok Ads for account {integration.account_id}")
    
    access_token = integration.access_token
    if not access_token:
        logger.warning("No access token for TikTok integration")
        return
    
    async with httpx.AsyncClient() as client:
        try:
            # Get advertiser info
            response = await client.get(
                "https://business-api.tiktok.com/open_api/v1.3/advertiser/info/",
                headers={
                    "Access-Token": access_token,
                },
                params={
                    "advertiser_ids": [],  # Would need to be populated from OAuth data
                }
            )
            
            if response.status_code != 200:
                logger.error(f"TikTok API error: {response.text}")
                return
                
            # Process response and store data
            # This is a placeholder - actual implementation depends on TikTok API structure
            
        except Exception as e:
            logger.error(f"TikTok sync error: {e}")
    
    integration.updated_at = datetime.utcnow()
    db.commit()


async def sync_shopify_orders(db: Session, integration: Integration):
    """
    Sync Shopify orders.
    Uses the Shopify Admin API.
    """
    logger.info(f"Syncing Shopify orders for account {integration.account_id}")
    
    access_token = integration.access_token
    shop_domain = integration.config_json  # Store shop domain in config
    
    if not access_token or not shop_domain:
        logger.warning("Missing Shopify credentials")
        return
    
    async with httpx.AsyncClient() as client:
        try:
            # Fetch recent orders
            response = await client.get(
                f"https://{shop_domain}/admin/api/2024-01/orders.json",
                headers={
                    "X-Shopify-Access-Token": access_token,
                },
                params={
                    "status": "any",
                    "created_at_min": (datetime.utcnow() - timedelta(days=30)).isoformat(),
                    "limit": 250,
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Shopify API error: {response.text}")
                return
            
            orders_data = response.json().get("orders", [])
            
            for order_data in orders_data:
                _process_shopify_order(db, integration.account_id, order_data)
                
            db.commit()
            logger.info(f"Synced {len(orders_data)} Shopify orders")
            
        except Exception as e:
            logger.error(f"Shopify sync error: {e}")
            db.rollback()


def _process_shopify_order(db: Session, account_id: str, order_data: dict):
    """Process and store a single Shopify order."""
    order_id = str(order_data["id"])
    
    # Check if order exists
    existing = db.query(Order).filter(
        Order.account_id == account_id,
        Order.source_order_id == order_id,
    ).first()
    
    if existing:
        return  # Skip existing orders
    
    # Parse attribution from order attributes/notes
    utm_source = None
    utm_campaign = None
    for attr in order_data.get("note_attributes", []):
        if attr.get("name") == "utm_source":
            utm_source = attr.get("value")
        if attr.get("name") == "utm_campaign":
            utm_campaign = attr.get("value")
    
    # Create order record
    order = Order(
        account_id=account_id,
        source_order_id=order_id,
        order_number=order_data.get("order_number"),
        platform="shopify",
        status=order_data.get("financial_status", "unknown"),
        total_price=float(order_data.get("total_price", 0)),
        subtotal=float(order_data.get("subtotal_price", 0)),
        tax=float(order_data.get("total_tax", 0)),
        shipping=float(order_data.get("total_shipping_price_set", {}).get("shop_money", {}).get("amount", 0)),
        discount=float(order_data.get("total_discounts", 0)),
        currency=order_data.get("currency", "USD"),
        customer_email=order_data.get("email"),
        utm_source=utm_source,
        utm_campaign=utm_campaign,
        attributed_channel=utm_source or "direct",
        order_date=datetime.fromisoformat(order_data["created_at"].replace("Z", "+00:00")),
    )
    
    db.add(order)


async def sync_ga4_metrics(db: Session, integration: Integration):
    """
    Sync Google Analytics 4 metrics.
    Uses the GA4 Data API.
    """
    logger.info(f"Syncing GA4 metrics for account {integration.account_id}")
    
    # GA4 requires service account or OAuth - placeholder implementation
    integration.updated_at = datetime.utcnow()
    db.commit()


async def check_pending_scheduled_reports():
    """
    Check for scheduled reports that need to be sent.
    Called periodically by the scheduler.
    """
    logger.info("Checking for pending scheduled reports")
    
    from app.services.scheduled_report_service import get_pending_reports, mark_report_sent
    
    db = SessionLocal()
    try:
        pending = get_pending_reports(db)
        
        for report in pending:
            try:
                # TODO: Generate and send the actual report email
                logger.info(f"Would send report '{report.name}' to {report.recipients}")
                
                # Mark as sent
                mark_report_sent(db, report)
                
            except Exception as e:
                logger.error(f"Error sending report {report.id}: {e}")
                
    finally:
        db.close()
